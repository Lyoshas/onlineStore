import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';
import {
    USER_EMAIL_MAX_LENGTH,
    USER_EMAIL_MIN_LENGTH,
} from 'src/common/common.constants';
import { emailSchema } from 'src/common/zod-schemas/email.schema';

export const checkEmailAvailabilitySchema = z.object({
    email: emailSchema,
});

type CheckEmailAvailabilitySchema = z.infer<
    typeof checkEmailAvailabilitySchema
>;

export class CheckEmailAvailabilityDto implements CheckEmailAvailabilitySchema {
    @ApiProperty({
        description:
            'Email address whose availability is being checked.',
        minLength: USER_EMAIL_MIN_LENGTH,
        maxLength: USER_EMAIL_MAX_LENGTH,
        format: 'email',
    })
    email: string;
}
