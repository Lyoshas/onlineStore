import { z } from 'zod';

const numericString = z
    .string()
    .regex(/\d+/, 'must be a number')
    .transform(Number);
const string = z.string();

export const environmentVariablesSchema = z.object({
    NODE_ENV: z.enum(['development', 'production']),
    POSTGRES_HOST: string,
    POSTGRES_PORT: numericString,
    POSTGRES_USERNAME: string,
    POSTGRES_PASSWORD: string,
    POSTGRES_DATABASE: string,
    RECAPTCHA_SECRET_KEY: string,
    HASHING_NUMBER_OF_SALT_ROUNDS: numericString,
    REDIS_PORT: numericString,
    REDIS_HOST: string,
    REDIS_USERNAME: string,
    REDIS_PASSWORD: string,
    REDIS_COMMAND_TIMEOUT: numericString,
    ACTIVATION_TOKEN_EXPIRATION_IN_SECONDS: numericString,
    SENDGRID_API_KEY: string,
    SENDGRID_FROM_EMAIL: string,
    RESET_TOKEN_EXPIRATION_IN_SECONDS: numericString,
});

export type EnvironmentVariables = z.infer<typeof environmentVariablesSchema>;
