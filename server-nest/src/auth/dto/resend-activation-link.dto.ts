import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';
import { RECAPTCHA_TOKEN_NAME } from 'src/common/common.constants';
import { recaptchaTokenSchema } from 'src/common/zod-schemas/recaptcha-token.schema';

export const resendActivationLinkSchema = z.object({
    login: z.string({ message: 'must be a string' }),
    password: z.string({ message: 'must be a string' }),
    [RECAPTCHA_TOKEN_NAME]: recaptchaTokenSchema,
});

type ResendActivationLinkSchema = z.infer<typeof resendActivationLinkSchema>;

export class ResendActivationLinkDto implements ResendActivationLinkSchema {
    @ApiProperty({
        description:
            'An email associated with the user who wants to resend the activation link.',
        format: 'email',
    })
    login: string;

    @ApiProperty({
        description: 'A password that is associated with the login.',
    })
    password: string;

    @ApiProperty({
        description:
            'A value obtained from solving the ReCAPTCHA v2 challenge.',
    })
    recaptchaToken: string;
}
