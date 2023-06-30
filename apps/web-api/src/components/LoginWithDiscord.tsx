import React from 'react'
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

const LoginWithDiscord: React.FC<{
    trigger: MutateFunction<{ code: string; provider: SocialProviderLogin }, any, any, any>
}> = ({ trigger }) => {
    const { query } = useRouter()
    const [loading, setLoading] = React.useState(false)
    const authState = useAuthTrackedStore()

    React.useEffect(() => {
        if (query && query.code && query.code?.length > 0) {
            authState.onSetSocialProviderLogin(SocialProviderLogin.PL_DISCORD)
            trigger({
                code: query.code,
                provider: SocialProviderLogin.PL_DISCORD
            })
        }
    }, [trigger, query])

    const loginToDiscord = () => {
        setLoading(true)
        window.location.assign(getDiscordUrl())
    }

    return (
        <button
            className="rounded-md bg-[#435761] text-white pt-2 pb-2 pl-4 pr-4 font-bold text-xl text-white inline-flex items-center"
            onClick={loginToDiscord}
            disabled={loading}
        >
            {loading ? 'Loading...' : 'Login with Discord'}
        </button>
    )
}

export default LoginWithDiscord
