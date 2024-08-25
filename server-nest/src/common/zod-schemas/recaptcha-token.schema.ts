import { z } from 'zod';

export const recaptchaTokenSchema = z
    .string({ message: 'must be a string' })
    .min(1, 'must be specified');
