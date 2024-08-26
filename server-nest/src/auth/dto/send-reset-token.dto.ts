import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';
import {
    RECAPTCHA_TOKEN_NAME,
    USER_EMAIL_MAX_LENGTH,
    USER_EMAIL_MIN_LENGTH,
} from 'src/common/common.constants';
import { recaptchaTokenSchema } from 'src/common/zod-schemas/recaptcha-token.schema';
import { emailSchema } from 'src/common/zod-schemas/email.schema';

export const sendResetTokenSchema = z.object({
    email: emailSchema,
    [RECAPTCHA_TOKEN_NAME]: recaptchaTokenSchema,
});

type SendResetTokenSchema = z.infer<typeof sendResetTokenSchema>;

export class SendResetTokenDto implements SendResetTokenSchema {
    @ApiProperty({
        description:
            'The email address where the password reset link will be sent. This email must be tied to any existing account within the application.',
        minLength: USER_EMAIL_MIN_LENGTH,
        maxLength: USER_EMAIL_MAX_LENGTH,
        format: 'email',
    })
    email: string;

    @ApiProperty({
        description:
            'A value obtained from solving the ReCAPTCHA v2 challenge.',
    })
    recaptchaToken: string;
}
