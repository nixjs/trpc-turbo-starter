import { Types } from '@nixjs23n6/types'
import axios from 'axios'
import jwtConfig from '../../config'
import { SocialInfo } from './types'

export interface GithubAccessToken {
    access_token: string
    token_type: string
    scope: string
}

interface GithubUser {
    login: string
    id: number
    node_id: 'U_kgDOB_TQsg'
    avatar_url: string
    gravatar_id: string
    url: string
    html_url: string
    followers_url: string
    following_url: string
    gists_url: string
    starred_url: string
    subscriptions_url: string
    organizations_url: string
    repos_url: string
    events_url: string
    received_events_url: string
    type: string
    site_admin: boolean
    name: string
    company: Types.Nullable<string>
    blog: string
    location: Types.Nullable<string>
    email: Types.Nullable<string>
    hireable: Types.Nullable<string>
    bio: Types.Nullable<string>
    twitter_username: Types.Nullable<string>
    public_repos: number
    public_gists: number
    followers: number
    following: number
    created_at: string
    updated_at: string
}

export async function verifyGithubAccount(code: string): Promise<SocialInfo> {
    const params = `?client_id=${jwtConfig.githubClientId}&client_secret=${jwtConfig.githubClientSecret}&code=${code}`
    const { data: access } = await axios.post<GithubAccessToken>(
        `https://github.com/login/oauth/access_token${params}`,
        {},
        {
            headers: {
                Accept: 'application/json'
            }
        }
    )
    if (access) {
        const {
            data: { id, name, avatar_url, email }
        } = await axios.get<GithubUser>('https://api.github.com/user', {
            headers: {
                Accept: 'application/vnd.github+json',
                Authorization: `Bearer ${access.access_token}`
            }
        })
        return { id: String(id), name, avatar: avatar_url, email: email || undefined }
    }
    throw new Error('Failed to get token from github oauth')
}
