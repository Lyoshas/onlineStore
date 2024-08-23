import {
    ArgumentMetadata,
    PipeTransform,
} from '@nestjs/common';
import { ZodSchema } from 'zod';
import { ValidationException } from '../exceptions/validation.exception';

// this pipe will help us validate incoming user data using Zod
export class ZodValidationPipe implements PipeTransform {
    constructor(private readonly schema: ZodSchema) {}

    // validating user data
    transform(value: unknown, metadata: ArgumentMetadata) {
        const validation = this.schema.safeParse(value);
        if (validation.success) return value;
        throw new ValidationException(
            validation.error.issues.map((zodIssue) => ({
                message: zodIssue.message,
                field: String(zodIssue.path[0]),
            }))
        );
    }
}
