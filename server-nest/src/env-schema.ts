import { z } from 'zod';
import { NodeEnv } from './common/enums/node-env.enum';

const numericString = z
    .string()
    .regex(/\d+/, 'must be a number')
    .transform(Number);
const string = z.string();

export const environmentVariablesSchema = z.object({
    NODE_ENV: z.enum([NodeEnv.DEVELOPMENT, NodeEnv.PRODUCTION]),
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
    REFRESH_TOKEN_EXPIRATION_IN_SECONDS: numericString,
    ACCESS_TOKEN_SECRET: string,
    ACCESS_TOKEN_EXPIRES_IN: string,
    COOKIE_SECRET: string,
    GOOGLE_CLIENT_ID: string,
    GOOGLE_CLIENT_SECRET: string,
    FACEBOOK_CLIENT_ID: string,
    FACEBOOK_CLIENT_SECRET: string,
    OAUTH_REDIRECT_URI: string,
});

export type EnvironmentVariables = z.infer<typeof environmentVariablesSchema>;
