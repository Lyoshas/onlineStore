import { z } from 'zod';
import {
    USER_EMAIL_MAX_LENGTH,
    USER_EMAIL_MIN_LENGTH,
} from '../common.constants';

export const emailSchema = z
    .string({ message: 'must be a string' })
    .email({ message: 'must be a valid email' })
    .refine(
        (email) =>
            email.length >= USER_EMAIL_MIN_LENGTH &&
            email.length <= USER_EMAIL_MAX_LENGTH,
        `must be ${USER_EMAIL_MIN_LENGTH} to ${USER_EMAIL_MAX_LENGTH} characters long`
    );
