import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
    overwrite: true,
    schema: 'https://reimanns-api.neuland.app/graphql',
    documents: ['src/**/*.ts'],
    ignoreNoDocuments: true,
    generates: {
        'src/__generated__/': {
            preset: 'client',
            config: {
                documentMode: 'string',
            },
        },
        'src/__generated__/schema.graphql': {
            plugins: ['schema-ast'],
            config: {
                includeDirectives: true,
            },
        },
    },
    config: {
        scalars: {
            Date: 'string',
        },
    },
}

export default config
