import type { TypedDocumentString } from '@/__generated__/graphql'

export async function execute<TResult, TVariables>(
    endpoint: string,
    query: TypedDocumentString<TResult, TVariables>,
    ...[variables]: TVariables extends Record<string, never> ? [] : [TVariables]
): Promise<{ data: TResult; errors?: Array<{ message: string }> }> {
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/graphql-response+json',
        },
        body: JSON.stringify({
            query,
            variables,
        }),
    })

    if (!response.ok) {
        throw new Error(
            `Network response was not ok: ${response.status} ${response.statusText}`
        )
    }

    return response.json()
}
