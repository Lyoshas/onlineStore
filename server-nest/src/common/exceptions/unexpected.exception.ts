import { HttpStatus } from '@nestjs/common';
import { CustomException } from './custom.exception';

export class UnexpectedException extends CustomException {
    constructor(errorMessage?: string) {
        super(
            [{ message: errorMessage || 'Something went wrong' }],
            HttpStatus.UNPROCESSABLE_ENTITY
        );
    }
}
