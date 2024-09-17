import { GraphQLDefinitionsFactory } from '@nestjs/graphql';
import { join } from 'path';

const definitionsFactory = new GraphQLDefinitionsFactory();
definitionsFactory.generate({
    // specifies where to look for .graphql files
    typePaths: ['./**/*.graphql'],
    // specifies where the GraphQL definitions factory should save our generated TypeScript output files
    path: join(process.cwd(), 'src/graphql-types.ts'),
    // saves as classes
    outputAs: 'class',
    // recreates typings whenever any .graphql file changes
    watch: true,
    // resolvers (query/mutation/etc) are generated as plain fields without arguments
    skipResolverArgs: true,
    defaultTypeMapping: {
        // map IDs to numbers instead of strings
        ID: 'number',
    },
});
