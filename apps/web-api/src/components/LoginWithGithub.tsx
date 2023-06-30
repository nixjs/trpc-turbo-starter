import React from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useRouter } from 'next/router'
import { SocialProviderLogin } from '@prisma/client'
import { MutateFunction } from '@tanstack/react-query'
import { useAuthTrackedStore } from 'client/utils/authStore'
import { Config } from 'client/configs/env'

export function getGitHubUrl(from: string) {
    const rootURl = 'https://github.com/login/oauth/authorize'

    const options = {
        client_id: Config.AUTH_GITHUB_CLIENT_ID,
        redirect_uri: Config.AUTH_REDIRECT,
        scope: 'user:email',
        state: from
    }

    const qs = new URLSearchParams(options)

    return `${rootURl}?${qs.toString()}`
}

const LoginWithGithub: React.FC<{ trigger: MutateFunction<{ code: string; provider: SocialProviderLogin }, any, any, any> }> = ({
    trigger
}) => {
    const { query } = useRouter()
    const [loading, setLoading] = React.useState(false)
    const authState = useAuthTrackedStore()

    React.useEffect(() => {
        if (query && query.code && query.code?.length > 0) {
            authState.onSetSocialProviderLogin(SocialProviderLogin.PL_GITHUB)
            trigger({
                code: query.code,
                provider: SocialProviderLogin.PL_GITHUB
            })
        }
    }, [trigger, query])

    const loginToGithub = () => {
        setLoading(true)
        window.location.assign(getGitHubUrl(uuidv4()))
    }

    return (
        <button
            className="rounded-md bg-[#435761] text-white pt-2 pb-2 pl-4 pr-4 font-bold text-xl text-white inline-flex items-center"
            onClick={loginToGithub}
            disabled={loading}
        >
            {loading ? 'Loading...' : 'Login with GitHub'}
        </button>
    )
}

export default LoginWithGithub
