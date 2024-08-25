import { HttpStatus } from '@nestjs/common';
import { CustomException } from './custom.exception';

export class InvalidCredentialsException extends CustomException {
    constructor() {
        super([{ message: 'invalid credentials' }], HttpStatus.UNAUTHORIZED);
    }
}
