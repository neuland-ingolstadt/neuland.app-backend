import { GraphQLError } from 'graphql'
import { logger } from '@/utils/logger'

const DEFAULT_CORE_API_BASE_URL = 'https://core.api.neuland.app'

export function getCoreApiBaseUrl(): string {
    return (
        process.env.CORE_API_BASE_URL?.replace(/\/$/, '') ||
        DEFAULT_CORE_API_BASE_URL
    )
}

export async function coreApiFetch<T>(
    path: string,
    init?: RequestInit
): Promise<T> {
    const url = `${getCoreApiBaseUrl()}${path}`

    let response: Response
    try {
        response = await fetch(url, {
            ...init,
            headers: {
                Accept: 'application/json',
                ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
                ...init?.headers
            }
        })
    } catch (error) {
        logger.error('Core API request failed', { url, err: error })
        throw new GraphQLError('Failed to reach Core API')
    }

    if (!response.ok) {
        const body = await response.text().catch(() => '')
        logger.error('Core API returned an error', {
            url,
            status: response.status,
            body
        })
        throw new GraphQLError(
            `Core API request failed with status ${response.status}`
        )
    }

    if (response.status === 204) {
        return undefined as T
    }

    return (await response.json()) as T
}
