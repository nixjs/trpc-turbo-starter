import jwt, { SignOptions } from 'jsonwebtoken'
import { Types } from '@nixjs23n6/types'
import jwtDecode, { JwtPayload } from 'jwt-decode'
import { PrivateKeyType, PublicKeyType } from '@packages/server/model/auth'
import jwtConfig from '../config'

export function signJwt(payload: Object, key: PrivateKeyType, options: SignOptions = {}) {
    const privateKey = Buffer.from(jwtConfig[key], 'base64').toString('ascii')
    return jwt.sign(payload, privateKey, {
        ...(options && options),
        algorithm: 'RS256'
    })
}

export function verifyJwt<T>(token: string, key: PublicKeyType): Types.Nullable<T> {
    try {
        const publicKey = Buffer.from(jwtConfig[key], 'base64').toString('ascii')
        return jwt.verify(token, publicKey) as T
    } catch (error) {
        return null
    }
}

export function isJwtTokeExpired(token: string): boolean {
    try {
        jwtDecode(token, { header: true })
        const d = jwtDecode(token)
        if (!d) throw new Error('Can not decode token')
        const { exp } = d as JwtPayload
        if (!exp) throw new Error('Token expired')
        return Number(exp) * 1000 < Date.now()
    } catch (error) {
        return true
    }
}

export function decodeJwtToken<T extends { [props: string]: any }>(token: string, header?: boolean): Types.Nullable<T> {
    try {
        if (header) return jwtDecode(token, { header: true })
        return jwtDecode(token)
    } catch (error) {
        return null
    }
}
