import { HttpStatus, Injectable } from '@nestjs/common';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { ChainableCommander } from 'ioredis';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
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
import { ValidationException } from 'src/common/exceptions/validation.exception';
import { OAuthUserData } from './interfaces/oauth-user-data.interface';
import { PasswordService } from './password/password.service';
import { AxiosError } from 'axios';
import { oauthCallbackSchema } from './dto/oauth-callback.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly hashingService: HashingService,
        private readonly dataSource: DataSource,
        private readonly authTokenService: AuthTokenService,
        private readonly configService: ConfigService<EnvironmentVariables>,
        private readonly emailService: EmailService,
        private readonly redisService: RedisService,
        private readonly httpService: HttpService,
        private readonly jwtService: JwtService,
        private readonly passwordService: PasswordService,
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

    async oauthCallback(
        state: string,
        authorizationCode: string
    ): Promise<{
        accessToken: string;
        refreshToken: string;
        isSignedUp: boolean;
    }> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const oauthState = await queryRunner.manager.findOne(OAuthState, {
                where: {
                    state,
                },
                relations: { oauthProvider: true },
            });

            if (oauthState === null) {
                throw new ValidationException([
                    { message: 'invalid "state" paremeter', field: 'state' },
                ]);
            }

            await queryRunner.manager.remove(oauthState);

            const { firstName, lastName, email }: OAuthUserData =
                await this.getOAuthUserData(
                    authorizationCode,
                    oauthState.oauthProvider.name
                );

            let existingUser = await queryRunner.manager.findOne(User, {
                where: { email },
                relations: { role: true },
            });
            let isSignedUp: boolean = false;

            if (existingUser === null) {
                const user = new User();
                user.email = email;
                user.firstName = firstName;
                user.lastName = lastName;
                user.password = await this.hashingService.hash(
                    this.passwordService.generateStrongPassword()
                );
                // if the user is trying to create an account with their existing Google/Facebook account,
                // there's no point in verifying their email
                user.isActivated = true;
                user.role = await queryRunner.manager.findOneByOrFail(
                    UserRole,
                    {
                        role: UserRoleEnum.BASIC_USER,
                    }
                );

                existingUser = await queryRunner.manager.save(user);
                isSignedUp = true;
            }

            const refreshToken =
                await this.authTokenService.generateUnregisteredToken();
            await this.authTokenService.registerToken(
                {
                    tokenType: TokenType.REFRESH_TOKEN,
                    token: refreshToken,
                    user: existingUser,
                },
                queryRunner
            );

            const accessToken: string =
                await this.authTokenService.generateAccessToken(existingUser);
            await queryRunner.commitTransaction();

            return {
                accessToken,
                refreshToken,
                isSignedUp,
            };
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    private async getOAuthUserData(
        authorizationCode: string,
        oauthProvider: OAuthProviderEnum.GOOGLE | OAuthProviderEnum.FACEBOOK
    ): Promise<OAuthUserData> {
        switch (oauthProvider) {
            case OAuthProviderEnum.GOOGLE:
                const idToken = await this.getGoogleIdToken(authorizationCode);
                return this.getUserDataFromGoogleIdToken(idToken);
            case OAuthProviderEnum.FACEBOOK:
                const accessToken =
                    await this.getFacebookAccessToken(authorizationCode);
                return this.getUserDataFromFacebookAccessToken(accessToken);
        }
    }

    private async getGoogleIdToken(authorizationCode: string): Promise<string> {
        const { data } = await firstValueFrom(
            this.httpService
                .post(
                    'https://oauth2.googleapis.com/token?' +
                        new URLSearchParams({
                            client_id:
                                this.configService.get<string>(
                                    'GOOGLE_CLIENT_ID'
                                )!,
                            client_secret: this.configService.get<string>(
                                'GOOGLE_CLIENT_SECRET'
                            )!,
                            code: authorizationCode,
                            grant_type: 'authorization_code',
                            redirect_uri:
                                this.configService.get<string>(
                                    'OAUTH_REDIRECT_URI'
                                )!,
                        }).toString()
                )
                .pipe(
                    catchError((error: AxiosError) => {
                        if (
                            (error.response?.data as any).error_description ===
                            'Malformed auth code.'
                        ) {
                            throw new ValidationException([
                                {
                                    message: 'invalid authorization code',
                                    field: 'code',
                                },
                            ]);
                        }
                        throw error;
                    })
                )
        );
        return data.id_token as string;
    }

    private getUserDataFromGoogleIdToken(idToken: string): OAuthUserData {
        const userData = this.jwtService.decode(idToken);
        return {
            firstName: userData.given_name as string,
            lastName: userData.family_name as string,
            email: userData.email as string,
        };
    }

    private async getFacebookAccessToken(
        authorizationCode: string
    ): Promise<string> {
        const { data } = await firstValueFrom(
            this.httpService
                .post(
                    'https://graph.facebook.com/v6.0/oauth/access_token?' +
                        new URLSearchParams({
                            redirect_uri:
                                this.configService.get<string>(
                                    'OAUTH_REDIRECT_URI'
                                )!,
                            client_id:
                                this.configService.get<string>(
                                    'FACEBOOK_CLIENT_ID'
                                )!,
                            client_secret: this.configService.get<string>(
                                'FACEBOOK_CLIENT_SECRET'
                            )!,
                            code: authorizationCode,
                        })
                )
                .pipe(
                    catchError((error: AxiosError) => {
                        if (
                            (error.response?.data as any).error?.message ===
                            'Invalid verification code format.'
                        ) {
                            throw new ValidationException([
                                {
                                    message: 'invalid authorization code',
                                    field: 'code',
                                },
                            ]);
                        }
                        throw error;
                    })
                )
        );

        return data.access_token as string;
    }

    private async getUserDataFromFacebookAccessToken(
        accessToken: string
    ): Promise<OAuthUserData> {
        const { data } = await firstValueFrom(
            this.httpService.get(
                'https://graph.facebook.com/me?fields=first_name,last_name,email,picture',
                { headers: { Authorization: `Bearer ${accessToken}` } }
            )
        );

        return {
            firstName: data.first_name,
            lastName: data.last_name,
            email: data.email,
        };
    }
}
