import { MetadataToken, PrivateKeyType } from '@packages/server/model/auth'
import { signJwt } from '../utils/jwt'

export const signJwtToken = async (privateKey: PrivateKeyType, metadata: MetadataToken, tokenExpiresIn?: number) => {
    const token = signJwt({ metadata }, privateKey, {
        expiresIn: tokenExpiresIn ? `${tokenExpiresIn}m` : undefined,
        issuer: 'omegalabs',
        algorithm: 'HS256'
    })
    return token
}
