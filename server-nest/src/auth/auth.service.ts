import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { ChainableCommander } from 'ioredis';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthTokenService } from './auth-token/auth-token.service';
import { EnvironmentVariables } from 'src/env-schema';
import { UnexpectedException } from 'src/common/exceptions/unexpected.exception';
import { EmailService } from 'src/common/services/email.service';
import { AUTH_ENDPOINTS_PREFIX } from './auth.constants';
import { User } from './entities/user.entity';
import { HashingService } from './hashing/hashing.service';
import { RedisService } from 'src/common/services/redis.service';
import { TokenType } from './enums/token-type.enum';

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
        private readonly userRepository: Repository<User>
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
            this.configService.get<string>('NODE_ENV') === 'development'
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
}
