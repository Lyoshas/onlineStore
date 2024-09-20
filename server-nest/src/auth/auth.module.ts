import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { HashingService } from './hashing/hashing.service';
import { BcryptService } from './hashing/bcrypt.service';
import { AuthTokenService } from './auth-token/auth-token.service';
import { UserRole } from './entities/user-role.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { EnvironmentVariables } from 'src/env-schema';
import { OAuthProvider } from './entities/oauth-provider.entity';
import { OAuthState } from './entities/oauth-state.entity';
import { PasswordService } from './password/password.service';
import { IdentifyUserMiddleware } from './middlewares/identify-user.middleware';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            User,
            UserRole,
            RefreshToken,
            OAuthProvider,
            OAuthState,
        ]),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: (
                configService: ConfigService<EnvironmentVariables>
            ) => ({
                secret: configService.get<string>('ACCESS_TOKEN_SECRET')!,
                signOptions: {
                    expiresIn: configService.get<string>(
                        'ACCESS_TOKEN_EXPIRES_IN'
                    )!,
                    algorithm: 'HS256',
                },
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        {
            // now classes will be able to inject concrete hashing implementations while referring to the generic "HashingService"
            provide: HashingService,
            useClass: BcryptService,
        },
        AuthTokenService,
        PasswordService,
    ],
})
export class AuthModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(IdentifyUserMiddleware).forRoutes('*');
    }
}
