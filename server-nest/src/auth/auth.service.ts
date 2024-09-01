import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { ChainableCommander } from 'ioredis';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import { AuthTokenService } from './auth-token/auth-token.service';
import { EnvironmentVariables } from 'src/env-schema';
import { UnexpectedException } from 'src/common/exceptions/unexpected.exception';
import { EmailService } from 'src/common/services/email.service';
import { AUTH_ENDPOINTS_PREFIX } from './auth.constants';
import { User } from './entities/user.entity';
import { HashingService } from './hashing/hashing.service';
import { RedisService } from 'src/common/services/redis.service';
import { TokenType } from './enums/token-type.enum';
import { UserRole } from './entities/user-role.entity';
import { UserRole as UserRoleEnum } from './enums/user-role.enum';
import { NodeEnv } from 'src/common/enums/node-env.enum';
import { OAuthProvider as OAuthProviderEnum } from './enums/oauth-provider.enum';
import { OAuthState } from './entities/oauth-state.entity';
import { OAuthProvider } from './entities/oauth-provider.entity';

@Injectable()
export class AuthService {
    constructor(
        private readonly hashingService: HashingService,
        private readonly dataSource: DataSource,
        private readonly authTokenService: AuthTokenService,
        private readonly configService: ConfigService<EnvironmentVariables>,
        private readonly emailService: EmailService,
        private readonly redisService: RedisService,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(OAuthProvider)
        private readonly oauthProviderRepository: Repository<OAuthProvider>,
        @InjectRepository(OAuthState)
        private readonly oauthStateRepository: Repository<OAuthState>
    ) {}

    async signUp(signupData: {
        email: string;
        firstName: string;
        lastName: string;
        plaintextPassword: string;
        isActivated: boolean;
    }): Promise<{ activationToken: string }> {
        const { email, firstName, lastName, plaintextPassword, isActivated } =
            signupData;

        let redisTransaction: ChainableCommander =
            this.redisService.client.multi();
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const user = new User();
            user.email = email;
            user.firstName = firstName;
            user.lastName = lastName;
            user.password = await this.hashingService.hash(plaintextPassword);
            user.isActivated = isActivated;
            user.role = await queryRunner.manager.findOneByOrFail(UserRole, {
                role: UserRoleEnum.BASIC_USER,
            });

            const savedUser = await queryRunner.manager.save(user);
            const activationToken =
                await this.authTokenService.generateUnregisteredToken();

            redisTransaction = this.authTokenService.registerToken({
                tokenType: TokenType.ACTIVATION_TOKEN,
                token: activationToken,
                userId: savedUser.id,
                expirationTimeInSeconds: this.configService.get<number>(
                    'ACTIVATION_TOKEN_EXPIRATION_IN_SECONDS'
                )!,
            });

            await redisTransaction.exec();
            await queryRunner.commitTransaction();

            return { activationToken };
        } catch (err) {
            console.error(err);
            redisTransaction.discard();
            await queryRunner.rollbackTransaction();
            throw new UnexpectedException(
                'Something went wrong while signing the user up'
            );
        } finally {
            await queryRunner.release();
        }
    }

    generateActivationLink(httpHost: string, activationToken: string) {
        const protocol: 'http' | 'https' =
            this.configService.get<NodeEnv>('NODE_ENV') === NodeEnv.DEVELOPMENT
                ? 'http'
                : 'https';
        return `${protocol}://${httpHost}/${AUTH_ENDPOINTS_PREFIX}/activate-account/${activationToken}`;
    }

    sendSignupEmailMessage(recipient: string, activationLink: string) {
        return this.emailService.sendEmail(
            recipient,
            '[onlineStore] Підтвердження email',
            `
                <p>Дякуємо за реєстрацію!</p>
                <p>Будь ласка, перейдіть за посиланням для підтвердження електронної пошти:</p>
                <a href="${activationLink}">${activationLink}</a>
            `
        );
    }

    async isEmailAvailable(email: string): Promise<boolean> {
        const exists = await this.userRepository.exists({ where: { email } });
        return !exists;
    }

    async activateAccount(userId: number): Promise<void> {
        const existingUser = await this.userRepository.findOneByOrFail({
            id: userId,
        });
        existingUser.isActivated = true;
        await this.userRepository.save(existingUser);
    }

    async getUserByCredentials(
        email: string,
        plaintextPassword: string
    ): Promise<User | null> {
        const existingUser = await this.userRepository.findOne({
            where: {
                email,
            },
            relations: {
                role: true,
            },
        });
        if (existingUser === null) return null;
        const passwordsMatch = await this.hashingService.compare(
            plaintextPassword,
            existingUser.password
        );
        if (!passwordsMatch) return null;
        return existingUser;
    }

    resendActivationLink(email: string, activationLink: string) {
        return this.emailService.sendEmail(
            email,
            '[onlineStore] Підтвердження email',
            `
                <p>Ви надіслали запит на повторну активацію акаунту.</p>
                <p>Будь ласка, перейдіть за посиланням для підтвердження електронної пошти:</p>
                <a href="${activationLink}">${activationLink}</a>
            `
        );
    }

    async getUserIdByEmail(email: string): Promise<number | null> {
        const existingUser = await this.userRepository.findOneBy({ email });
        return existingUser === null ? null : existingUser.id;
    }

    generateResetPasswordLink(httpHost: string, resetToken: string): string {
        const protocol: 'http' | 'https' =
            this.configService.get<NodeEnv>('NODE_ENV') === NodeEnv.DEVELOPMENT
                ? 'http'
                : 'https';
        return `${protocol}://${httpHost}/${AUTH_ENDPOINTS_PREFIX}/reset-password/${resetToken}`;
    }

    async sendResetPasswordEmailMessage(
        resetPasswordLink: string,
        email: string
    ) {
        return this.emailService.sendEmail(
            email,
            '[onlineStore] Змінення пароля',
            `
                <p>Ви запросили посилання для змінення пароля.</p>
                <p>Будь ласка, перейдіть за посиланням:</p>
                <a href="${resetPasswordLink}">${resetPasswordLink}</a>
                <p>Це посилання дійсне лише протягом 1 години.</p>
            `
        );
    }

    async changePassword(
        userId: number,
        newPlaintextPassword: string,
        resetToken: string
    ) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const existingUser = await queryRunner.manager.findOneByOrFail(
                User,
                {
                    id: userId,
                }
            );
            existingUser.password =
                await this.hashingService.hash(newPlaintextPassword);
            await queryRunner.manager.save(existingUser);
            await this.authTokenService.revokeToken(
                TokenType.RESET_TOKEN,
                resetToken
            );

            await queryRunner.commitTransaction();
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    // The "state" parameter is a unique string used to prevent CSRF attacks.
    // It is generated when creating a link to the OAuth 2.0 authorization
    // server and is stored in the database. When the user is redirected back to
    // our application after consenting, the returned "state" parameter is
    // checked against the stored value to ensure the request is valid and it
    // indeed came from the relevant authorization server.
    async addOAuthStateToDB(
        state: string,
        oauthProviderName: OAuthProviderEnum
    ): Promise<void> {
        const oauthStateParameter = new OAuthState();
        oauthStateParameter.oauthProvider =
            await this.oauthProviderRepository.findOneByOrFail({
                name: oauthProviderName,
            });
        oauthStateParameter.state = state;
        await this.oauthStateRepository.save(oauthStateParameter);
    }

    generateStateParameter(): Promise<string> {
        return new Promise((resolve, reject) => {
            const TOKEN_LENGTH = 64;
            randomBytes(TOKEN_LENGTH / 2, (err, buf) => {
                if (err) reject(err);
                resolve(buf.toString('hex'));
            });
        });
    }

    getUrlToGoogleAuthorizationServer(state: string): string {
        return `
            https://accounts.google.com/o/oauth2/v2/auth
                ?client_id=${encodeURI(this.configService.get<string>('GOOGLE_CLIENT_ID')!)}
                &redirect_uri=${encodeURI(this.configService.get<string>('OAUTH_REDIRECT_URI')!)}
                &scope=email%20profile
                &response_type=code
                &state=${encodeURI(state)}
        `.replace(/\s/g, '');
    }

    getUrlToFacebookAuthorizationServer(state: string): string {
        return `
            https://www.facebook.com/dialog/oauth
                ?client_id=${encodeURI(this.configService.get<string>('FACEBOOK_CLIENT_ID')!)}
                &redirect_uri=${encodeURI(this.configService.get<string>('OAUTH_REDIRECT_URI')!)}
                &state=${encodeURI(state)}
                &scope=public_profile,email
        `.replace(/\s/g, '');
    }
}
