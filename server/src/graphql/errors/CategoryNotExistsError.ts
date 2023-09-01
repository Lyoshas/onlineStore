import { GraphQLError } from 'graphql';

class CategoryNotExistsError extends GraphQLError {
    constructor() {
        super('The specified category does not exist');
    }
}

export default CategoryNotExistsError;
