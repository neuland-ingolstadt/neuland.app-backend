import axios from 'axios'
import { GraphQLError } from 'graphql'
import jwt, { type JwtPayload } from 'jsonwebtoken'
import jwkToPem from 'jwk-to-pem'
import { logger } from '@/utils/logger'

export const adminRole = 'next-dashboard-admin'
export const sportRole = 'next-dashboard-sports'
export const announcementRole = 'next-dashboard-announcements'
export const eventRole = 'next-dashboard-events'
export const reportsRole = 'next-dashboard-reports'

const jwkUrl = 'https://auth.neuland.ing/application/o/api-dashboard/jwks/'

async function getPublicKey(): Promise<string> {
    const response = await axios.get(jwkUrl)
    const jwk = response.data.keys[0]
    return jwkToPem(jwk)
}

export async function getUserFromToken(bearer: string): Promise<JwtPayload> {
    const publicKey = await getPublicKey()
    try {
        const token = bearer.split(' ')[1]
        const payload = jwt.verify(token, publicKey, { algorithms: ['RS256'] })
        return payload as JwtPayload
    } catch (error) {
        logger.warn('Failed to verify token', { err: error })
        throw new Error('Failed to verify token')
    }
}

export function checkAuthorization(
    contextValue: {
        jwtPayload?: { groups: string[] }
    },
    requiredRole: string
): void {
    if (
        process.env.NODE_ENV !== 'production' &&
        Bun.env.BYPASS_AUTH_IN_DEV === 'true'
    ) {
        logger.warn('Authorization check skipped in development environment', {
            requiredRole
        })
        return
    }

    if (!contextValue.jwtPayload) {
        throw new GraphQLError('Not authorized: Missing JWT payload')
    }

    if (
        !contextValue.jwtPayload.groups.includes(requiredRole) &&
        !contextValue.jwtPayload.groups.includes(adminRole)
    ) {
        throw new GraphQLError('Not authorized: Insufficient permissions')
    }
}
