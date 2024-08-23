import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { ChainableCommander } from 'ioredis';
import { RedisService } from 'src/common/services/redis.service';

@Injectable()
export class AuthTokenService {
    constructor(private readonly redisService: RedisService) {}

    // this method doesn't send anything to the Redis server until the outer method calls "exec()" on the result of this method
    registerToken(tokenData: {
        tokenType: 'activationToken' | 'resetToken';
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
}
