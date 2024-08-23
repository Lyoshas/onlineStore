import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { EnvironmentVariables } from 'src/env-schema';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private redis: Redis;

    constructor(
        private readonly configService: ConfigService<EnvironmentVariables>
    ) {}

    onModuleInit() {
        this.redis = new Redis({
            port: this.configService.get<number>('REDIS_PORT')!,
            host: this.configService.get<string>('REDIS_HOST')!,
            username: this.configService.get<string>('REDIS_USERNAME')!,
            password: this.configService.get<string>('REDIS_PASSWORD')!,
            // If a command does not return a reply within a set number of milliseconds,
            // a "Command timed out" error will be thrown.
            commandTimeout: this.configService.get<number>(
                'REDIS_COMMAND_TIMEOUT'
            )!,
        });
    }

    get client() {
        return this.redis;
    }

    onModuleDestroy() {
        this.redis.disconnect();
    }
}
