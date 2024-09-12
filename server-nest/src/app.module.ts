import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
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
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
