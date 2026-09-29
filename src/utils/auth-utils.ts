import axios from 'axios'
import { GraphQLError } from 'graphql'
import jwt, { type JwtPayload } from 'jsonwebtoken'
import jwkToPem from 'jwk-to-pem'

/** New Authentik group names (dashboard) plus legacy display names. */
export const adminRoles = [
    'next-dashboard-admin',
    'Neuland Next Admin'
] as const
export const sportRoles = [
    'next-dashboard-sports',
    'Neuland Next Hochschulsport'
] as const
export const announcementRoles = [
    'next-dashboard-announcements',
    'Neuland Next Announcements'
] as const
export const eventRoles = ['Neuland Next Events'] as const
export const reportsRoles = ['next-dashboard-reports'] as const

/** Primary role strings passed into `checkAuthorization`. */
export const adminRole = adminRoles[0]
export const sportRole = sportRoles[0]
export const announcementRole = announcementRoles[0]
export const eventRole = eventRoles[0]
export const reportsRole = reportsRoles[0]

const roleAliases: Record<string, readonly string[]> = {
    [adminRole]: adminRoles,
    'Neuland Next Admin': adminRoles,
    [sportRole]: sportRoles,
    'Neuland Next Hochschulsport': sportRoles,
    [announcementRole]: announcementRoles,
    'Neuland Next Announcements': announcementRoles,
    [eventRole]: eventRoles,
    [reportsRole]: reportsRoles
}

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
        console.error('Failed to verify token:', error)
        throw new Error('Failed to verify token')
    }
}

function expandRoles(requiredRole: string): readonly string[] {
    return roleAliases[requiredRole] ?? [requiredRole]
}

function hasAnyGroup(groups: string[], roles: readonly string[]): boolean {
    return roles.some((role) => groups.includes(role))
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
        console.warn('Authorization check skipped in development environment')
        return
    }

    if (!contextValue.jwtPayload) {
        throw new GraphQLError('Not authorized: Missing JWT payload')
    }

    const groups = contextValue.jwtPayload.groups
    const allowed = expandRoles(requiredRole)

    if (!hasAnyGroup(groups, allowed) && !hasAnyGroup(groups, adminRoles)) {
        throw new GraphQLError('Not authorized: Insufficient permissions')
    }
}
