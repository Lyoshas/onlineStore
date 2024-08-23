import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { fromError } from 'zod-validation-error';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnvironmentVariables, environmentVariablesSchema } from './env-schema';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';

@Module({
    imports: [
        // initializing ConfigModule, which loads ConfigService, which, in turn, loads environment variables
        ConfigModule.forRoot({
            // validating environment variables using Zod
            validate(config: Record<string, unknown>) {
                const validationResult =
                    environmentVariablesSchema.safeParse(config);
                if (validationResult.success) {
                    // returning validated data (data may be changed because of how Zod works)
                    return validationResult.data;
                }
                throw fromError(validationResult.error);
            },
            validationOptions: {
                // forbids unknown keys in the environment variables
                allowUnknown: false,
                // returns all validation errors
                abortEarly: false,
            },
            // with 'isGlobal' we can use this module across the entire application without importing it
            isGlobal: true,
        }),
        // TypeORM configuration
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (
                configService: ConfigService<EnvironmentVariables>
            ) => ({
                type: 'postgres',
                host: configService.get('POSTGRES_HOST'),
                port: configService.get('POSTGRES_PORT'),
                username: configService.get('POSTGRES_USERNAME'),
                password: configService.get('POSTGRES_PASSWORD'),
                database: configService.get('POSTGRES_DATABASE'),
                // entities will be loaded automatically
                autoLoadEntities: true,
                // if set to 'true', the database schema will be auto created on every application launch
                synchronize: configService.get('NODE_ENV') === 'development',
            }),
            inject: [ConfigService],
        }),
        CommonModule,
        AuthModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
