import axios from 'axios'
import jwt, { type JwtPayload } from 'jsonwebtoken'
import jwkToPem from 'jwk-to-pem'

export const sportRole = 'Neuland Next Hochschulsport'
export const announcementRole = 'Neuland Next Announcements'
const jwkUrl =
    'https://sso.informatik.sexy/application/o/neulandnextpanel/jwks/'

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
