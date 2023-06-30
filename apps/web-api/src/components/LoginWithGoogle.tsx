import React from 'react'
import { SocialProviderLogin } from '@prisma/client'
import { useGoogleLogin, CodeResponse } from '@react-oauth/google'
import { MutateFunction } from '@tanstack/react-query'
import toast from 'react-hot-toast'
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

const LoginWithGoogle: React.FC<{
    trigger: MutateFunction<{ code: string; provider: SocialProviderLogin }, any, any, any>
}> = ({ trigger }) => {
    const [toastId, setToastId] = React.useState<string | null>('')
    const [loading, setLoading] = React.useState(false)
    const authState = useAuthTrackedStore()

    const handleGoogle = () => {
        const id = toast('Waiting for Google authentication to log in, please wait a moment...')
        setToastId(id)
        setLoading(true)
    }

    const handleResponseGoogle = useGoogleLogin({
        onSuccess: (response: CodeResponse) => {
            if (response.code) {
                authState.onSetSocialProviderLogin(SocialProviderLogin.PL_GOOGLE)
                trigger({
                    code: response.code,
                    provider: SocialProviderLogin.PL_GOOGLE
                })
                setLoading(false)
            }
        },
        onError: () => {
            toastId && toast.remove(toastId)
        },
        flow: 'auth-code',
        redirect_uri: Config.AUTH_REDIRECT
    })

    return (
        <button
            type="button"
            className="rounded-md bg-[#435761] text-white pt-2 pb-2 pl-4 pr-4 font-bold text-xl text-white inline-flex items-center"
            onClick={() => {
                handleGoogle()
                handleResponseGoogle()
            }}
            disabled={loading}
        >
            {loading ? 'Loading...' : 'Login with Google'}
        </button>
    )
}

export default LoginWithGoogle
