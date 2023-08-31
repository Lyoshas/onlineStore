import { GraphQLError } from 'graphql';

export class IncorrectShortDescriptionLengthError extends GraphQLError {
    constructor() {
        super('Short description length must be between 1 and 300 characters');
    }
}
