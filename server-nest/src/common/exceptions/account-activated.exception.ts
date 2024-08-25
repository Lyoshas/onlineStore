import { HttpStatus } from '@nestjs/common';
import { CustomException } from './custom.exception';

export class AccountActivatedException extends CustomException {
    constructor() {
        super(
            [{ message: 'account is already activated' }],
            HttpStatus.CONFLICT
        );
    }
}
