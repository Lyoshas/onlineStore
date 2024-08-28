import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';
import { RECAPTCHA_TOKEN_NAME } from 'src/common/common.constants';
import { recaptchaTokenSchema } from 'src/common/zod-schemas/recaptcha-token.schema';
import { passwordSchema } from 'src/common/zod-schemas/password.schema';

export const changePasswordSchema = z.object({
    resetToken: z.string({ message: 'must be a string' }),
    password: passwordSchema,
    [RECAPTCHA_TOKEN_NAME]: recaptchaTokenSchema,
});

type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;

export class ChangePasswordDto implements ChangePasswordSchema {
    @ApiProperty({
        description:
            'A token that will be used to identify which user this request applies to. Must be a string, must not be empty, and must not be expired. The reset token is revoked after the password is changed.',
    })
    resetToken: string;

    @ApiProperty({
        description:
            'A new password that will be applied to the corresponding user. Must consist of at least 8 characters, not exceeding 72 characters, including at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character',
        minLength: 8,
        maxLength: 72,
        example: 'Passw0rd*&4',
    })
    password: string;

    @ApiProperty({
        description:
            'A value obtained from solving the ReCAPTCHA v2 challenge.',
    })
    recaptchaToken: string;
}
