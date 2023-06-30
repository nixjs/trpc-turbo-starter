import { WebClient } from '@slack/web-api'
import jwtConfig from '../../config'
import { SocialInfo } from './types'

const client = new WebClient()

export async function verifySlackAccount(code: string): Promise<SocialInfo> {
    const response = await client.oauth.v2.access({
        client_id: jwtConfig.slackClientId,
        client_secret: jwtConfig.slackClientSecret,
        code
    })
    if (!response.authed_user || !response.authed_user?.access_token) throw new Error('Failed to get token from slack oauth')

    const access = await client.users.identity({
        token: response.authed_user?.access_token
    })

    if (access && access.ok && access.user && access.user.id) {
        const {
            user: { email, id, name, image_192 }
        } = access
        return { id, name, email, avatar: image_192 }
    }
    throw new Error('Failed to get user info from slack oauth')
}
