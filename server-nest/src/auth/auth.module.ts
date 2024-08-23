import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { HashingService } from './hashing/hashing.service';
import { BcryptService } from './hashing/bcrypt.service';
import { AuthTokenService } from './auth-token/auth-token.service';

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    controllers: [AuthController],
    providers: [
        AuthService,
        {
            // now classes will be able to inject concrete hashing implementations while referring to the generic "HashingService"
            provide: HashingService,
            useClass: BcryptService,
        },
        AuthTokenService,
    ],
})
export class AuthModule {}
