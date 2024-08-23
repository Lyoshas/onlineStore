import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { ValidationException } from '../exceptions/validation.exception';

@Injectable()
export class EmailAvailabilityPipe implements PipeTransform {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ) {}

    async transform(
        value: string,
        metadata: ArgumentMetadata
    ): Promise<string> {
        const emailInUse = await this.userRepository.exists({
            where: { email: value },
        });
        if (!emailInUse) return value;
        throw new ValidationException([
            { message: 'the email is already taken', field: 'email' },
        ]);
    }
}
