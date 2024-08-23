import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';
import { RECAPTCHA_TOKEN_NAME } from 'src/common/common.constants';

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
    email: z
        .string({ message: 'must be a string' })
        .email({ message: 'must be a valid email' })
        .refine(
            (email) => email.length >= 1 && email.length <= 254,
            'must be 1 to 254 characters long'
        ),
    password: z.string({ message: 'must be a string' }).refine(
        (password) => {
            const rules: RegExp[] = [
                /[a-z]/,
                /[A-Z]/,
                /[0-9]/,
                /[!@#$%^&*()\-=_\+`~;':\/\\.,<>?}{}|]/,
            ];
            return (
                rules.every((regex) => regex.test(password)) &&
                password.length >= 8 &&
                password.length <= 72
            );
        },
        'must consist of at least 8 characters, ' +
            'not exceeding 72 characters, ' +
            'including at least 1 uppercase letter, 1 lowercase letter, ' +
            '1 number and 1 special character'
    ),
    [RECAPTCHA_TOKEN_NAME]: z
        .string({ message: 'must be a string' })
        .min(1, 'must be specified'),
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
            'Email address of the user. Must be unique, meaning no two users can have the same email.',
        minLength: 1,
        maxLength: 254,
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
