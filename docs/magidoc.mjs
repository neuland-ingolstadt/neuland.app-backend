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
        paths: ['src/schema/*.gql'],
    },
    website: {
        template: './docs/template',
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

                        Neuland API uses **GraphQL** to provide a flexible and powerful API for [Neuland Next](https://neuland.app) and several internal services.
                        \\
                        This documentation provides a detailed overview of the API and its capabilities.

                        ### Endpoints

                        We provide two endpoints for the API: Production and Development.\\
                        Refer to the following table for more information and links to the respective documentation.

                        :::tabs
                        ---Production

                        - **Docs**: [https://api.neuland.app/](https://api.neuland.app/)
                        - **Endpoint**: [https://api.neuland.app/graphql](https://api.neuland.app/graphql)
                        - **GitHub**: [Main Branch](https://github.com/neuland-ingolstadt/neuland.app-backend/tree/main)

                        ---Development

                        - **Docs**: [https://api.dev.neuland.app/](https://api.dev.neuland.app/)
                        - **Endpoint**: [https://api.dev.neuland.app/graphql](https://api.dev.neuland.app/graphql)
                        - **GitHub**: [Dev Branch](https://github.com/neuland-ingolstadt/neuland.app-backend/tree/develop)

                        :::

                        :::notification type="info"
                        **Note**: The development endpoint is subject to change and may not be available at all times. We recommend using the production endpoint for most cases.
                        :::

                        ### Authentication

                        Most of the API features do not require authentication.
                        However, some endpoints are only accessible to authenticated Neuland members.
                        This applies to internal services and administrative endpoints.
                        We do not provide any external authentication methods.

                        ### Interactive Playground

                        We cannot provide a public interactive playground, but you can run the backend server locally by following the instructions in the GitHub repository.\\
                        Here you can test the API and explore its capabilities.

                        #### Legal Notice

                        This public API is provided exclusively for **research** and **private, non-commercial use**. Any use of the API, its data, or its documentation for production, commercial, or business purposes is **strictly prohibited**. This includes, but is not limited to, integrating the API into commercial products, services, or workflows, or using it in any environment that serves end-users beyond personal or academic research.

                        By accessing or using this API, you agree to the following terms:

                        - **No Production Use:** You may not use the API, its endpoints, or any part of its data in any production system, public-facing application, or service intended for real-world deployment or commercial benefit.
                        - **No Commercial Use:** The API and its documentation may not be used, either directly or indirectly, for any commercial, revenue-generating, or business-related activities.
                        - **Permitted Use:** You may use the API solely for personal projects, academic research, experimentation, or educational purposes. If you are unsure whether your use case qualifies, please contact us for clarification.
                        - **No Warranty:** The API is provided "as is" without any warranty of any kind, express or implied. We make no guarantees regarding availability, performance, or fitness for any particular purpose.
                        - **Subject to Change:** The API, its endpoints, and its documentation are subject to change or discontinuation at any time without notice. We reserve the right to restrict or revoke access at our sole discretion.
                        - **Data Privacy:** Do not use the API to process, store, or transmit any sensitive, confidential, or personal data beyond what is necessary for research or private use. You are responsible for ensuring compliance with all applicable data protection laws.
                        - **Attribution:** If you use the API in academic work or publications, please provide appropriate attribution to Neuland Ingolstadt e.V.
                        - **Contact:** For questions about permitted use, licensing, or to request exceptions, please contact us at info@neuland-ingolstadt.de.

                        By continuing to use this API, you acknowledge and accept these terms. Unauthorized use may result in access being revoked and potential legal action.

                        \\
                        This API is provided by Neuland Ingolstadt e.V.
                        \\
                        \\
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
                LocationInput: '["IngolstadtMensa", "Reimanns"]',
            },
        },
    },
}
