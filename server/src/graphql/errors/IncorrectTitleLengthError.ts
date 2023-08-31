import { GraphQLError } from 'graphql';

export class IncorrectTitleLengthError extends GraphQLError {
    constructor() {
        super('Title length must be between 1 and 200 characters');
    }
}
