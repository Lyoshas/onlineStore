import { Schema, ValidationError } from 'yup';
import { GraphQLError } from 'graphql';

const validateSchema = async (validationSchema: Schema, value: unknown) => {
    try {
        await validationSchema.validate(value, { abortEarly: true });
    } catch (e: any) {
        if (e instanceof ValidationError) {
            throw new GraphQLError(e.errors[0]);
        }
        throw new Error(e);
    }
};

export default validateSchema;
