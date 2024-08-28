import { z } from 'zod';

export const passwordSchema = z.string({ message: 'must be a string' }).refine(
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
);
