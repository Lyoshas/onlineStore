import { z } from 'zod';

export const refreshTokenSchema = z
    .string({ message: 'must be a string' })
    .min(1, 'must be specified');
