import { OAuth2Client } from 'google-auth-library'
import jwtConfig from '../../config'
import { SocialInfo } from './types'

export async function verifyGoogleAccount(code: string): Promise<SocialInfo> {
    const oAuth2Client = new OAuth2Client(jwtConfig.googleClientId, jwtConfig.googleClientSecret, jwtConfig.appRedirectUri)
    const token = await oAuth2Client.getToken(code)
    if (token && token.tokens.id_token) {
        const ticket = await oAuth2Client.verifyIdToken({
            idToken: token.tokens.id_token
        })
        const payload = ticket.getPayload()
        if (!payload) throw new Error('Failed to get payload')
        const { name, email, sub, picture } = payload
        return { id: sub, name, email, avatar: picture }
    }
    throw new Error('Failed to get token from google oauth')
}
