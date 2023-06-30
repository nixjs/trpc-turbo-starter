import { TRPCError } from '@trpc/server'
import { SocialProviderLogin, User, UserSocial } from '@trpc-turbo/db'
import { Interfaces, Types } from '@nixjs23n6/types'
import { AuthReply } from '@packages/server/model/auth'
import { FlowStatus } from '@packages/server/model/auth/enum'
import {
    verifyGoogleAccount,
    verifyGithubAccount,
    verifyDiscordAccount,
    verifyTelegramAccount,
    verifySlackAccount,
    SocialInfo
} from '@packages/server/utils/auth'
import { Context } from '../createContext'
import { LoginSocialUserInput, VerifyTelegramInput } from '../schema/userSocial.schema'
import { createUser } from '../services/user'
import { findSocialUser, signTokens } from '../services/userSocial'
import { storeCookieHandler } from './auth'

export const loginHandler = async ({
    input,
    ctx: { req, res }
}: {
    input: LoginSocialUserInput
    ctx: Context
}): Promise<Interfaces.ResponseData<AuthReply>> => {
    try {
        let verified: Types.Nullable<SocialInfo> = null
        const { provider, code, telegramData } = input
        if (
            ([SocialProviderLogin.PL_GITHUB, SocialProviderLogin.PL_GOOGLE, SocialProviderLogin.PL_DISCORD].includes(provider as any) &&
                code.length === 0) ||
            (SocialProviderLogin.PL_TELEGRAM === provider && (!telegramData || (telegramData && Object.keys(telegramData).length === 0))) ||
            SocialProviderLogin.PL_NONE === provider
        )
            throw new Error('Provider login invalid')
        switch (provider) {
            case SocialProviderLogin.PL_GITHUB:
                verified = await verifyGithubAccount(code as string)
                break
            case SocialProviderLogin.PL_GOOGLE:
                verified = await verifyGoogleAccount(code as string)
                break
            case SocialProviderLogin.PL_DISCORD:
                verified = await verifyDiscordAccount(code as string)
                break
            case SocialProviderLogin.PL_SLACK:
                verified = await verifySlackAccount(code as string)
                break
            case SocialProviderLogin.PL_TELEGRAM:
                verified = await verifyTelegramAccount(telegramData as VerifyTelegramInput)
                break
            default:
                break
        }

        if (!verified)
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: `Invalid provider login ${provider}`
            })

        let user: Types.Nullable<UserSocial | User> = null
        let userId: Types.Nullable<string> = null

        const params = { socialProviderId: verified.id, socialProvider: provider as SocialProviderLogin }

        const { email, name } = verified
        user = await findSocialUser(params)
        if (!user || user.userId.length === 0) {
            user = await createUser({
                email,
                name,
                accountSocials: {
                    create: [
                        {
                            ...params
                        }
                    ]
                }
            })
            if (user) userId = user.id
        } else {
            userId = user.userId
        }
        if (!userId) {
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Invalid account'
            })
        }

        const { accessToken, refreshToken } = await signTokens({
            ...params,
            id: userId
        })

        storeCookieHandler(req, res, accessToken, refreshToken)

        return {
            status: 'SUCCESS',
            data: {
                accessToken,
                refreshToken,
                otpVerificationToken: '',
                signatureVerificationToken: ' ',
                status: FlowStatus.FS_COMPLETED
            }
        }
    } catch (err: any) {
        return {
            status: 'ERROR',
            error: err
        }
    }
}
