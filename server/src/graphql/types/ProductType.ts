import {
    GraphQLObjectType,
    GraphQLInt,
    GraphQLString,
    GraphQLFloat,
    GraphQLBoolean,
} from 'graphql';

export default new GraphQLObjectType({
    name: 'Product',
    fields: () => ({
        id: { type: GraphQLInt },
        title: { type: GraphQLString },
        price: { type: GraphQLFloat },
        previewURL: { type: GraphQLString },
        isAvailable: { type: GraphQLBoolean },
        isRunningOut: { type: GraphQLBoolean }
    })
});
