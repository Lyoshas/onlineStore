import {
    GraphQLObjectType,
    GraphQLInt
} from 'graphql';

export default new GraphQLObjectType({
    name: 'ProductID',
    fields: () => ({
        id: { type: GraphQLInt }
    })
});
