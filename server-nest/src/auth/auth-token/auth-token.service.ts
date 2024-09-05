import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { ChainableCommander } from 'ioredis';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, QueryRunner, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { CookieOptions, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { RedisService } from 'src/common/services/redis.service';
import { TokenType } from '../enums/token-type.enum';
import { RefreshToken } from '../entities/refresh-token.entity';
import { User } from '../entities/user.entity';
import { AccessTokenPayload } from '../interfaces/access-token-payload.interface';
import { EnvironmentVariables } from 'src/env-schema';
import { UserRole as UserRoleEnum } from '../enums/user-role.enum';
import { NodeEnv } from 'src/common/enums/node-env.enum';

@Injectable()
export class AuthTokenService {
    private cookieStaticOptions: CookieOptions;

    constructor(
        private readonly redisService: RedisService,
        @InjectRepository(RefreshToken)
        private readonly refreshTokenRepository: Repository<RefreshToken>,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService<EnvironmentVariables>
    ) {
        this.cookieStaticOptions = {
            httpOnly: true,
            secure:
                this.configService.get<NodeEnv>('NODE_ENV') ===
                NodeEnv.PRODUCTION,
            path: '/api/auth',
            sameSite: 'strict',
        };
    }

    registerToken(tokenData: {
        tokenType: TokenType.ACTIVATION_TOKEN | TokenType.RESET_TOKEN;
        token: string;
        userId: number;
        expirationTimeInSeconds: number;
    }): ChainableCommander;
    registerToken(
        tokenData: {
            tokenType: TokenType.REFRESH_TOKEN;
            token: string;
            user: User;
        },
        existingQueryRunner?: QueryRunner
    ): Promise<void>;
    registerToken(
        tokenData: {
            tokenType:
                | TokenType.ACTIVATION_TOKEN
                | TokenType.RESET_TOKEN
                | TokenType.REFRESH_TOKEN;
            token: string;
            user?: User;
            userId?: number;
            expirationTimeInSeconds?: number;
        },
        existingQueryRunner?: QueryRunner
    ): ChainableCommander | Promise<void> {
        const { tokenType, token, userId, user, expirationTimeInSeconds } =
            tokenData;

        if (
            [TokenType.ACTIVATION_TOKEN, TokenType.RESET_TOKEN].includes(
                tokenType
            )
        ) {
            // this method doesn't send anything to the Redis server until the outer method calls "exec()" on the result of this method
            return this.redisService.client
                .multi()
                .hset(token, { type: tokenType, userId: userId! })
                .expire(token, expirationTimeInSeconds!);
        }

        const registerRefreshToken = async () => {
            const refreshToken = new RefreshToken();
            refreshToken.token = token;
            refreshToken.expiresAt = this.getRefreshTokenExpirationDate(
                this.configService.get<number>(
                    'REFRESH_TOKEN_EXPIRATION_IN_SECONDS'
                )!
            );
            refreshToken.user = user!;

            // if the queryRunner is provided, it means a transaction is currently taking place
            if (existingQueryRunner) {
                await existingQueryRunner.manager.save(refreshToken);
            } else {
                await this.refreshTokenRepository.save(refreshToken);
            }
        };

        return registerRefreshToken();
    }

    private getRefreshTokenExpirationDate(
        expirationTimeInSeconds: number
    ): Date {
        const MILLISECONDS = 1000;
        return new Date(Date.now() + expirationTimeInSeconds * MILLISECONDS);
    }

    // this token won't be saved anywhere
    // to save it, use the "registerToken" method
    generateUnregisteredToken(): Promise<string> {
        return new Promise((resolve, reject) => {
            const TOKEN_LENGTH = 32;
            return randomBytes(TOKEN_LENGTH, (err, buf) => {
                if (err) reject(err);
                resolve(buf.toString('hex'));
            });
        });
    }

    async getUserIdByActivationToken(
        activationToken: string
    ): Promise<number | null> {
        const [type, userId] = await this.redisService.client.hmget(
            activationToken,
            'type',
            'userId'
        );

        if (type !== TokenType.ACTIVATION_TOKEN || userId === null) return null;
        return +userId;
    }

    async getUserIdByResetToken(resetToken: string): Promise<number | null> {
        const [type, userId] = await this.redisService.client.hmget(
            resetToken,
            'type',
            'userId'
        );

        if (type !== TokenType.RESET_TOKEN || userId === null) return null;
        return +userId;
    }

    revokeToken(
        tokenType: TokenType.ACTIVATION_TOKEN | TokenType.RESET_TOKEN,
        token: string
    ) {
        return this.redisService.client.del(token);
    }

    generateAccessToken(user: User): Promise<string> {
        return this.jwtService.signAsync(
            this.generateAccessTokenPayload(user),
            {
                expiresIn: this.configService.get<string>(
                    'ACCESS_TOKEN_EXPIRES_IN'
                )!,
            }
        );
    }

    private generateAccessTokenPayload(user: User): AccessTokenPayload {
        return {
            id: user.id,
            email: user.email,
            role: user.role.role as UserRoleEnum,
        };
    }

    attachRefreshTokenAsCookie(response: Response, refreshToken: string) {
        const MILLISECONDS = 1000;
        response.cookie(TokenType.REFRESH_TOKEN, refreshToken, {
            expires: new Date(
                Date.now() +
                    this.configService.get<number>(
                        'REFRESH_TOKEN_EXPIRATION_IN_SECONDS'
                    )! *
                        MILLISECONDS
            ),
            ...this.cookieStaticOptions,
        });
    }

    detachRefreshTokenAsCookie(response: Response) {
        // web browsers and other compliant clients will only clear the cookie
        // if the given options are identical to those given to res.cookie(),
        // excluding expires and maxAge
        response.clearCookie('refreshToken', this.cookieStaticOptions);
    }

    async getUserByRefreshToken(token: string): Promise<User | null> {
        const refreshToken = await this.refreshTokenRepository.findOne({
            where: {
                token,
                expiresAt: MoreThan(new Date()),
            },
            relations: {
                user: {
                    role: true,
                },
            },
        });
        return refreshToken === null ? null : refreshToken.user;
    }

    async deleteRefreshToken(token: string): Promise<void> {
        const refreshToken = await this.refreshTokenRepository.findOneBy({
            token,
        });
        if (refreshToken === null) return;
        this.refreshTokenRepository.remove(refreshToken);
    }
}
