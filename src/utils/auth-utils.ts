import jwt, { type JwtPayload } from 'jsonwebtoken'

const secret = Bun.env.JWT_SECRET || ''

export function getUserFromToken(token: string): JwtPayload {
    try {
        const res = jwt.verify(token, secret)
        console.log(res)
        return res as JwtPayload
    } catch {
        throw new Error('Invalid or expired token')
    }
}

export function getAuthRole(token: string): string {
    const user = getUserFromToken(token)
    return user.Role
}
