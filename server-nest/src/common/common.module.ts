import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { RedisService } from './services/redis.service';
import { EmailService } from './services/email.service';

@Global()
@Module({
    imports: [TypeOrmModule.forFeature([User]), HttpModule],
    // HttpModule won't be available to other modules unless we re-export it
    // now whenever you import CommonModule, you will import HttpModule as well
    providers: [RedisService, EmailService],
    exports: [HttpModule, RedisService, EmailService],
})
export class CommonModule {}
