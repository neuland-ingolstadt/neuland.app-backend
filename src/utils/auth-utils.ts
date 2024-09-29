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

export async function getUserFromToken(token: string): Promise<JwtPayload> {
    try {
        const publicKey = await getPublicKey()
        const res = jwt.verify(token, publicKey, { algorithms: ['RS256'] })
        return res as JwtPayload
    } catch {
        throw new Error('Invalid or expired token')
    }
}
