import { GraphQLError } from 'graphql';

export class PageOutOfRangeError extends GraphQLError {
    constructor() {
        super("The 'page' parameter must be greater than zero");
    }
}
