import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';
import { recaptchaTokenSchema } from 'src/common/zod-schemas/recaptcha-token.schema';
import { RECAPTCHA_TOKEN_NAME } from 'src/common/common.constants';

export const signInSchema = z.object({
    login: z.string({ message: 'must be a string' }),
    password: z.string({ message: 'must be a string' }),
    [RECAPTCHA_TOKEN_NAME]: recaptchaTokenSchema,
});

type SignInSchema = z.infer<typeof signInSchema>;

export class SignInDto implements SignInSchema {
    @ApiProperty({ description: 'Login of the user.' })
    login: string;

    @ApiProperty({ description: 'Password of the user.' })
    password: string;

    @ApiProperty({
        description:
            'A value obtained from solving the ReCAPTCHA v2 challenge.',
    })
    recaptchaToken: string;
}
