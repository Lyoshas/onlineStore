import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';
import {
    RECAPTCHA_TOKEN_NAME,
    USER_EMAIL_MAX_LENGTH,
    USER_EMAIL_MIN_LENGTH,
} from 'src/common/common.constants';
import { emailSchema } from 'src/common/zod-schemas/email.schema';
import { recaptchaTokenSchema } from 'src/common/zod-schemas/recaptcha-token.schema';
import { passwordSchema } from 'src/common/zod-schemas/password.schema';

export const signUpSchema = z.object({
    firstName: z
        .string({ message: 'must be a string' })
        .refine(
            (firstName) => firstName.length >= 1 && firstName.length <= 50,
            'must be 1 to 50 characters long'
        ),
    lastName: z
        .string({ message: 'must be a string' })
        .refine(
            (lastName) => lastName.length >= 1 && lastName.length <= 50,
            'must be 1 to 50 characters long'
        ),
    email: emailSchema,
    password: passwordSchema,
    [RECAPTCHA_TOKEN_NAME]: recaptchaTokenSchema,
});

type SignUpSchema = z.infer<typeof signUpSchema>;

export class SignUpDto implements SignUpSchema {
    @ApiProperty({
        description: 'First name of the user.',
        minLength: 1,
        maxLength: 50,
    })
    firstName: string;

    @ApiProperty({
        description: 'Last name of the user.',
        minLength: 1,
        maxLength: 50,
    })
    lastName: string;

    @ApiProperty({
        description:
            'Email address of the user. must be unique, meaning no two users can have the same email.',
        minLength: USER_EMAIL_MIN_LENGTH,
        maxLength: USER_EMAIL_MAX_LENGTH,
        format: 'email',
    })
    email: string;

    @ApiProperty({
        description:
            'Plaintext password of the user. Must include at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character.',
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
