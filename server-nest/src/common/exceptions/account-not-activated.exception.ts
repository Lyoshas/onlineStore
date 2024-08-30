import { HttpStatus } from '@nestjs/common';
import { CustomException } from './custom.exception';

export class AccountNotActivatedException extends CustomException {
    constructor() {
        super(
            [{ message: 'the account is not activated' }],
            HttpStatus.FORBIDDEN
        );
    }
}
