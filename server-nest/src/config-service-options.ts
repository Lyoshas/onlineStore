import { ConfigModuleOptions } from '@nestjs/config';
import { fromError } from 'zod-validation-error';
import { environmentVariablesSchema } from './env-schema';

export const configModuleOptions: ConfigModuleOptions = {
    // validating environment variables using Zod
    validate(config: Record<string, unknown>) {
        const validationResult = environmentVariablesSchema.safeParse(config);
        if (validationResult.success) {
            // returning validated data (data may be changed because of how Zod works)
            return validationResult.data;
        }
        throw fromError(validationResult.error);
    },
    validationOptions: {
        // forbids unknown keys in the environment variables
        allowUnknown: false,
        // returns all validation errors
        abortEarly: false,
    },
    // with 'isGlobal' we can use this module across the entire application without importing it
    isGlobal: true,
};
