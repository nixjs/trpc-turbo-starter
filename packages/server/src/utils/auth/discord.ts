import axios from 'axios'
import jwtConfig from '../../config'
import { SocialInfo } from './types'

export interface DiscordAccessToken {
    access_token: string
    refresh_token: string
    token_type: string
    scope: string
    expires_in: number
}

interface DiscordUser {
    id: string
    username: string
    discriminator: string
    global_name?: string
    avatar?: string
    bot?: boolean
    system?: boolean
    mfa_enabled?: boolean
    banner?: string
    accent_color?: number
    locale?: string
    verified?: boolean
    email?: string
    flags?: number
    premium_type?: number
    public_flags?: number
}

export async function verifyDiscordAccount(code: string): Promise<SocialInfo> {
    const { data: access } = await axios.post<DiscordAccessToken>(
        'https://discord.com/api/oauth2/token',
        new URLSearchParams({
            client_id: jwtConfig.discordClientId,
            client_secret: jwtConfig.discordClientSecret,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: jwtConfig.appRedirectUri
        }).toString(),
        {
            headers: {
                Accept: 'application/json'
            }
        }
    )
    if (access) {
        const {
            data: { id, global_name, email, avatar }
        } = await axios.get<DiscordUser>('https://discord.com/api/users/@me', {
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${access.access_token}`
            }
        })
        return { id, name: global_name, email, avatar }
    }
    throw new Error('Failed to get token from discord oauth')
}
