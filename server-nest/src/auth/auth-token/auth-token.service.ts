import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { ChainableCommander } from 'ioredis';
import { RedisService } from 'src/common/services/redis.service';
import { TokenType } from '../enums/token-type.enum';

@Injectable()
export class AuthTokenService {
    constructor(private readonly redisService: RedisService) {}

    // this method doesn't send anything to the Redis server until the outer method calls "exec()" on the result of this method
    registerToken(tokenData: {
        tokenType: TokenType.ACTIVATION_TOKEN | TokenType.RESET_TOKEN;
        token: string;
        userId: number;
        expirationTimeInSeconds: number;
    }): ChainableCommander {
        const { tokenType, token, userId, expirationTimeInSeconds } = tokenData;

        return this.redisService.client
            .multi()
            .hset(token, { type: tokenType, userId })
            .expire(token, expirationTimeInSeconds);
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
}
