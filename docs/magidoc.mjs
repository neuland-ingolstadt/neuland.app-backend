import path from 'path'
import { fileURLToPath } from 'url'

function relativePath(target) {
    return path.join(path.dirname(fileURLToPath(import.meta.url)), target)
}

function markdown(string) {
    const target = string[0]
    const trimSize = /^\s+/.exec(string)[0].length
    return target
        .split('\n')
        .map((line) => line.substr(trimSize - 1))
        .join('\n')
}

export default {
    introspection: {
        type: 'sdl',
        paths: [path.join('src', 'schema.gql')],
    },
    website: {
        template: 'carbon-multi-page',
        staticAssets: relativePath('./assets'),
        output: relativePath('out'),
        options: {
            appTitle: 'Neuland API',
            appLogo: '/logo.png',
            appFavicon: '/favicon.ico',
            siteMeta: {
                description:
                    'API Documentation for Neuland Services and Applications',
                keywords:
                    'neuland,api,documentation,neuland.app,Neuland Next,graphql',
            },
            pages: [
                {
                    title: 'Neuland API',
                    content: markdown`
                        # Neuland API Documentation

                        Neuland API uses **GraphQL** to provide a flexible and powerful API for [neuland.app](https://neuland.app) and [Neuland Next](https://next.neuland.app).
                        \\
                        This documentation provides a detailed overview of the API and its capabilities.

                        ### Endpoints

                        We provide two endpoints for the API: Production and Development.\\
                        Refer to the following table for more information and links to the respective documentation.

                        :::tabs
                        ---Production

                        -   **Docs**: [https://api.neuland.app/](https://api.neuland.app/)
                        -   **Endpoint**: [https://api.neuland.app/graphql](https://api.neuland.app/graphql)
                        -   **GitHub**: [Main Branch](https://github.com/neuland-ingolstadt/neuland.app-backend/tree/main)

                        ---Development

                        -   **Docs**: [https://api.dev.neuland.app/](https://api.dev.neuland.app/)
                        -   **Endpoint**: [https://api.dev.neuland.app/graphql](https://api.dev.neuland.app/graphql)
                        -   **GitHub**: [Dev Branch](https://github.com/neuland-ingolstadt/neuland.app-backend/tree/develop)

                        :::

                        :::notification type="info"
                        **Note**: The development endpoint is subject to change and may not be available at all times. We recommend using the production endpoint for most cases.
                        :::

                        ### Authentication

                        Most of the API features do not require authentication.
                        However, some endpoints are only accessible to authenticated users.\\
                        To authenticate, you need to provide a valid JWT token in the Authorization header.
                        Usually this applies to internal services and administrative endpoints.

                        ### Interactive Playground

                        We cannot provide a public interactive playground, but you can run the backend server locally by following the instructions in the GitHub repository.
                        Here you can test the API and explore its capabilities.

                        #### Legal Notice

                        This API is provided by Neuland Ingolstadt e.V.\\
                        
                        Email: info@neuland-ingolstadt.de\\
                        Website: [https://neuland-ingolstadt.de](https://neuland-ingolstadt.de)\\
                        Imprint: [https://next.neuland.app/legal/imprint](https://next.neuland.app/legal/imprint)

                        #### License

                        This API and its documentation are licensed under the [GNU Affero General Public License v3.0](https://www.gnu.org/licenses/agpl-3.0.html).
                    `,
                },
            ],
            externalLinks: [
                {
                    href: 'https://github.com/neuland-ingolstadt/neuland.app-backend',
                    label: 'GitHub repository',
                    position: 'header',
                    kind: 'Github',
                },
            ],
            queryGenerationFactories: {
                LocalTime: '<23:30:50>',
                EmailAddress: '<test@example.com>',
                URL: '<https://example.com>',
            },
        },
    },
}
