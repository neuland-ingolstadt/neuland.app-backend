import jwt, { type JwtPayload } from 'jsonwebtoken'

export function getUserFromToken(token: string): JwtPayload {
    try {
        const res = jwt.verify(token, 'your-secret-key')
        return res as JwtPayload
    } catch (error) {
        console.error(error)
        throw new Error('Invalid or expired token')
    }
}

export function getAuthRole(token: string): string {
    const user = getUserFromToken(token)
    return user.role
}
