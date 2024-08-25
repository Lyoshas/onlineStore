import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcryptjs from 'bcryptjs';
import { HashingService } from './hashing.service';
import { EnvironmentVariables } from 'src/env-schema';

@Injectable()
export class BcryptService implements HashingService {
    constructor(
        private readonly configService: ConfigService<EnvironmentVariables>
    ) {}

    async hash(data: string): Promise<string> {
        return bcryptjs.hash(
            data,
            this.configService.get<number>('HASHING_NUMBER_OF_SALT_ROUNDS')!
        );
    }

    compare(plaintext: string, encrypted: string): Promise<boolean> {
        return bcryptjs.compare(plaintext, encrypted);
    }
}
