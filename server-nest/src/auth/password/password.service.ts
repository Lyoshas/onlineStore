import { Injectable } from '@nestjs/common';
import * as generator from 'generate-password';
import { RandomService } from 'src/common/services/random.service';

@Injectable()
export class PasswordService {
    constructor(private readonly randomService: RandomService) {}

    // This function is used when the backend application creates a password on
    // behalf of a user.
    // Possible use cases:
    // - user signed up with their google account
    // - anonymous user created an order, so the system creates an account for this
    // user and sends the generated password to the user's email
    generateStrongPassword(): string {
        const MIN_PASSWORD_LENGTH = 20;
        const MAX_PASSWORD_LENGTH = 40;

        return generator.generate({
            length: this.randomService.randomInteger(
                MIN_PASSWORD_LENGTH,
                MAX_PASSWORD_LENGTH
            ),
            lowercase: true,
            uppercase: true,
            numbers: true,
            symbols: true,
            strict: true
        });
    }
}
