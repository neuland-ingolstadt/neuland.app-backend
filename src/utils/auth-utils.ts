import axios from 'axios'
import { GraphQLError } from 'graphql'
import jwt, { type JwtPayload } from 'jsonwebtoken'
import jwkToPem from 'jwk-to-pem'

export const eventRole = 'Neuland Next Events'
export const sportRole = 'Neuland Next Hochschulsport'
export const announcementRole = 'Neuland Next Announcements'
export const adminRole = 'Neuland Next Admin'
const jwkUrl = 'https://sso.informatik.sexy/application/o/api-dashboard/jwks/'

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

  if (
    !contextValue.jwtPayload.groups.includes(requiredRole) &&
    !contextValue.jwtPayload.groups.includes(adminRole)
  ) {
    throw new GraphQLError('Not authorized: Insufficient permissions')
  }
}
