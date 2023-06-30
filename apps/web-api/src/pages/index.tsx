import React from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'
import { NetworkSymbol, SocialProviderLogin, WalletProviderLogin } from '@prisma/client'
import { useAccount } from 'wagmi'
import { signMessage } from '@wagmi/core'
import { useWeb3Modal } from '@web3modal/react'
import { MutateFunction } from '@tanstack/react-query'
import { TelegramButton, TelegramUser } from '@nixjs23n6/telegram-login'
import { trpc } from 'client/utils/trpc'
import { useAuthTrackedStore } from 'client/utils/authStore'
import { Config } from 'client/configs/env'
import { NextPageWithLayout } from './_app'

const UserInfo = dynamic(() => import('../components/UserInfo'), { ssr: false })
const LoginWithGithub = dynamic<{ trigger: MutateFunction<{ code: string; provider: SocialProviderLogin }, any, any, any> }>(
    () => import('../components/LoginWithGithub'),
    { ssr: false }
)
const LoginWithDiscord = dynamic<{ trigger: MutateFunction<{ code: string; provider: SocialProviderLogin }, any, any, any> }>(
    () => import('../components/LoginWithDiscord'),
    { ssr: false }
)
const LoginWithGoogle = dynamic<{ trigger: MutateFunction<{ code: string; provider: SocialProviderLogin }, any, any, any> }>(
    () => import('../components/LoginWithGoogle'),
    { ssr: false }
)
const LoginWithSlack = dynamic<{ trigger: MutateFunction<{ code: string; provider: SocialProviderLogin }, any, any, any> }>(
    () => import('../components/LoginWithSlack'),
    { ssr: false }
)

const IndexPage: NextPageWithLayout = () => {
    const [loading, setLoading] = React.useState(false)
    const [userInfo, setUserInfo] = React.useState<any>(null)
    const [toastId, setToastId] = React.useState<string | null>('')
    const { open } = useWeb3Modal()
    const { isConnected, address } = useAccount()
    const authState = useAuthTrackedStore()

    const { mutate: triggerRegister, isLoading: isRegister } = trpc.register.useMutation({
        onSuccess(data) {
            toast(`Welcome ${data.data.user.name}!`)
        },
        onError(error) {
            toast(error.message)
        }
    })

    const { mutate: triggerLogin, isLoading: isLogin } = trpc.login.useMutation({
        onSuccess(data) {
            toast.success('[LoginInternal] Login with successfully')
            console.log('[LoginInternal]', data)
        },
        onError(error) {
            toast(error.message)
        }
    })

    const { mutate: triggerLoginWallet, isLoading: isLoginWallet } = trpc.loginWallet.useMutation({
        async onSuccess(data) {
            console.log('[LoginWallet] => Nonce', data)
            if (data && data.data?.challenge) {
                const {
                    data: { challenge, signatureVerificationToken }
                } = data
                const signature = await signMessage({
                    message: challenge.nonce
                })
                console.log('[LoginWallet] => signature', signature)
                if (signature) {
                    const id = toast.loading('Verifying signature')
                    setToastId(id)
                    triggerVerifyWallet({
                        signature,
                        verificationToken: signatureVerificationToken
                    })
                }
            }
        },
        onError(error) {
            toast(error.message)
        }
    })

    const { mutate: triggerVerifyWallet } = trpc.verifyWallet.useMutation({
        onSuccess(data) {
            console.log('[VerifyWallet]', data)
            toast.success('[VerifyWallet] Login with successfully')
            toastId && toast.remove(toastId)
        },
        onError(error) {
            toast(error.message)
        }
    })

    const { mutate: triggerLoginSocial } = trpc.loginSocial.useMutation({
        onSuccess(data) {
            console.log('[LoginSocial]', data, authState.socialProviderLogin)
            toast.success('[LoginSocial] Login with successfully')
            toastId && toast.remove(toastId)
        },
        onError(error) {
            toast(error.message)
        }
    })

    const { refetch } = trpc.userInfo.useQuery(
        {},
        {
            refetchOnWindowFocus: true,
            staleTime: 0,
            cacheTime: 0,
            refetchInterval: 0,
            enabled: false
        }
    )

    const handleOpenWalletModal = React.useCallback(async () => {
        setLoading(true)
        await open()
        setLoading(false)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleRegister = () => {
        triggerRegister({
            email: 'nghiweb@gmail.com',
            name: 'Nghi Nguyen',
            password: 'Nghi1@34',
            passwordConfirm: 'Nghi1@34'
        })
    }

    const handleLogin = () => {
        triggerLogin({
            email: 'nghiweb@gmail.com',
            password: 'Nghi1@34'
        })
    }

    const handleLoginWallet = React.useCallback(() => {
        if (address)
            triggerLoginWallet({
                networkSymbol: NetworkSymbol.NS_ETH,
                provider: WalletProviderLogin.PL_METAMASK,
                walletAddress: address
            })
        if (!isConnected) handleOpenWalletModal()
    }, [address, handleOpenWalletModal, isConnected, triggerLoginWallet])

    const handleResponseTelegram = React.useCallback((data: TelegramUser) => {
        if (data) {
            const { id, username, photo_url, auth_date, first_name, hash, last_name } = data
            console.log(data, ~~(Date.now() / 1000) - auth_date)
            const telegramData = {
                id,
                userName: username,
                photoUrl: photo_url,
                authDate: auth_date,
                firstName: first_name,
                hash,
                lastName: last_name
            }
            triggerLoginSocial({
                provider: SocialProviderLogin.PL_TELEGRAM,
                code: '',
                telegramData
            })
        }
    }, [])

    const handleUserInfo = () => {
        refetch().then((e) => {
            if (e.error) {
                toast.error('Failed to load user info')
                return false
            }
            setUserInfo(e.data)
            console.log('UserInfo', e.data)
        })
    }

    return (
        <div className="flex flex-col bg-gray-800 py-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold">Welcome to your tRPC with Prisma starter!</h1>
                <p className="text-gray-400">
                    If you get stuck, check{' '}
                    <Link className="underline" href="https://trpc.io">
                        the docs
                    </Link>
                    , write a message in our{' '}
                    <Link className="underline" href="https://trpc.io/discord">
                        Discord-channel
                    </Link>
                    , or write a message in{' '}
                    <Link className="underline" href="https://github.com/trpc/trpc/discussions">
                        GitHub Discussions
                    </Link>
                    .
                </p>
            </div>
            <div className="pt-4 flex flex-col items-center justify-center m-auto gap-[1rem]">
                <button
                    type="button"
                    className="rounded-md bg-[#435761] text-white pt-2 pb-2 pl-4 pr-4 font-bold text-xl text-white inline-flex items-center"
                    onClick={handleRegister}
                    disabled={isRegister}
                >
                    {isRegister ? 'Loading...' : 'Register'}
                </button>
                <button
                    type="button"
                    className="rounded-md bg-[#435761] text-white pt-2 pb-2 pl-4 pr-4 font-bold text-xl text-white inline-flex items-center"
                    onClick={handleLogin}
                    disabled={isLogin}
                >
                    {isLogin ? 'Loading...' : 'Login'}
                </button>
                <button
                    type="button"
                    className="rounded-md bg-[#435761] text-white pt-2 pb-2 pl-4 pr-4 font-bold text-xl text-white inline-flex items-center"
                    onClick={handleLoginWallet}
                    disabled={isLoginWallet}
                >
                    {isLoginWallet || loading ? 'Loading...' : 'Login with MetaMask'}
                </button>
                {/* <LoginWithGoogle trigger={triggerLoginSocial as any} />
                <LoginWithGithub trigger={triggerLoginSocial as any} /> */}
                {/* <LoginWithDiscord trigger={triggerLoginSocial as any} /> */}
                <LoginWithSlack trigger={triggerLoginSocial as any} />
                {/* <TelegramButton dataOnAuth={handleResponseTelegram} botName={Config.AUTH_TELEGRAM_BOT} /> */}
            </div>
            <div className="mt-4 flex items-center justify-center m-auto gap-[1rem]">
                <div>
                    <button
                        type="button"
                        className="rounded-md bg-[#435761] text-white pt-2 pb-2 pl-4 pr-4 font-bold text-xl text-white inline-flex items-center"
                        onClick={handleUserInfo}
                    >
                        User Info
                    </button>
                    <br />
                    <br />
                    <UserInfo data={userInfo} />
                </div>
            </div>
        </div>
    )
}

export default IndexPage
