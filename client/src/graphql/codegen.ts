import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
    schema: 'http://nginx/api/graphql',
    documents: ['src/**/*.tsx', 'src/**/*.ts'],
    generates: {
        './src/__generated__/': {
            preset: 'client',
            plugins: [],
            presetConfig: {
                gqlTagName: 'gql'
            }
        }
    },
    ignoreNoDocuments: true
};

export default config;
