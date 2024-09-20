import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { EnvironmentVariables } from './env-schema';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { NodeEnv } from './common/enums/node-env.enum';
import { ProductsModule } from './products/products.module';
import { configModuleOptions } from './config-service-options';

@Module({
    imports: [
        // initializing ConfigModule, which loads ConfigService, which, in turn, loads environment variables
        ConfigModule.forRoot(configModuleOptions),
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
                synchronize:
                    configService.get('NODE_ENV') === NodeEnv.DEVELOPMENT,
            }),
            inject: [ConfigService],
        }),
        CommonModule,
        AuthModule,
        ProductsModule,
        GraphQLModule.forRootAsync<ApolloDriverConfig>({
            driver: ApolloDriver,
            useFactory: (
                configService: ConfigService<EnvironmentVariables>
            ) => ({
                // "typePaths" specifies paths to files that contain GraphQL definitions
                typePaths: ['./**/*.graphql'],
                context: ({ req }) => ({ user: req.user }),
                formatError(formattedError) {
                    // if the environment is dev, leave the error as is
                    // otherwise only keep the 'message' so that nothing else is exposed to the user
                    if (
                        configService.get<NodeEnv>('NODE_ENV') ===
                        NodeEnv.DEVELOPMENT
                    ) {
                        return formattedError;
                    }
                    return { message: formattedError.message };
                },
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
