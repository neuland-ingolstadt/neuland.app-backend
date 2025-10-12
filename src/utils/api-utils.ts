import type { TypedDocumentString } from '@/__generated__/graphql'

/**
 * Executes a GraphQL query against an endpoint
 * @param endpoint  The GraphQL endpoint
 * @param query     The query to execute
 * @param param2  The variables for the query
 * @returns       The query result
 */
export async function executeGql<TResult, TVariables>(
    endpoint: string,
    query: TypedDocumentString<TResult, TVariables>,
    ...[variables]: TVariables extends Record<string, never> ? [] : [TVariables]
): Promise<{ data: TResult; errors?: Array<{ message: string }> }> {
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/graphql-response+json'
        },
        body: JSON.stringify({
            query,
            variables
        })
    })

    if (!response.ok) {
        throw new Error(
            `Network response was not ok: ${response.status} ${response.statusText}`
        )
    }

    return response.json()
}
