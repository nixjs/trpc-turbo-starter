/* eslint-disable @next/next/no-img-element */
import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { SocialProviderLogin } from '@prisma/client'
import { MutateFunction } from '@tanstack/react-query'
import { useAuthTrackedStore } from 'client/utils/authStore'
import { Config } from 'client/configs/env'

export function getDiscordUrl() {
    const rootURl = 'https://discord.com/api/oauth2/authorize'

    const options = {
        client_id: Config.AUTH_DISCORD_CLIENT_ID,
        redirect_uri: Config.AUTH_REDIRECT,
        response_type: 'code',
        scope: 'identify'
    }

    const qs = new URLSearchParams(options)

    return `${rootURl}?${qs.toString()}`
}

const LoginWithSlack: React.FC<{
    trigger: MutateFunction<{ code: string; provider: SocialProviderLogin }, any, any, any>
}> = ({ trigger }) => {
    const authState = useAuthTrackedStore()
    const { query } = useRouter()

    React.useEffect(() => {
        if (query && query.code && query.code?.length > 0) {
            authState.onSetSocialProviderLogin(SocialProviderLogin.PL_SLACK)
            trigger({
                code: query.code,
                provider: SocialProviderLogin.PL_SLACK
            })
        }
    }, [trigger, query])

    return (
        <Link href="https://slack.com/oauth/v2/authorize?client_id=5521712158801.5506169277189&scope=&user_scope=identity.basic,email">
            <img
                alt="Login with Slack"
                height="40"
                width="139"
                src="https://platform.slack-edge.com/img/add_to_slack.png"
                srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x"
            />
        </Link>
    )
}

export default LoginWithSlack
