import { TRPCError } from '@trpc/server'
import { User, UserWallet } from '@trpc-turbo/db'
import { Interfaces, Types } from '@nixjs23n6/types'
import { AuthReply, MetadataToken } from '@packages/server/model/auth'
import { FlowStatus, TokenRole } from '@packages/server/model/auth/enum'
import { verifyJwt, decodeJwtToken } from '@packages/server/utils/jwt'
import redisClient from '@packages/server/utils/connectRedis'
import { NetworkSymbol, WalletProviderLogin } from '.prisma/client'
import { Context } from '../createContext'
import { LoginWalletUserInput, WalletSignatureInput } from '../schema/userWallet.schema'
import { createUser } from '../services/user'
import { findWalletUser, signVerificationToken, signTokens } from '../services/userWallet'
import { createNonce, verifyMessage } from '../utils/signature'
import { storeCookieHandler } from './auth'
import jwtConfig from '../config'

export const loginHandler = async ({
    input
}: {
    input: LoginWalletUserInput
    ctx: Context
}): Promise<Interfaces.ResponseData<AuthReply>> => {
    try {
        const { walletAddress, networkSymbol, provider } = input

        let user: Types.Nullable<UserWallet | User> = null
        let userId: Types.Nullable<string> = null

        user = await findWalletUser({
            walletAddress,
            networkSymbol: networkSymbol as NetworkSymbol,
            walletProvider: provider as WalletProviderLogin
        })
        if (!user || user.userId.length === 0) {
            user = await createUser({
                accountWallets: {
                    create: [
                        {
                            walletAddress,
                            networkSymbol: networkSymbol as NetworkSymbol,
                            walletProvider: provider as WalletProviderLogin
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

        const nonce = createNonce()
        const { verificationToken } = await signVerificationToken({
            networkSymbol: networkSymbol as NetworkSymbol,
            walletAddress,
            walletProvider: provider as WalletProviderLogin,
            id: userId
        })
        redisClient.set(`${walletAddress}-${networkSymbol}-${provider}-nonce`, nonce, {
            EX: jwtConfig.redisCacheExpiresIn * 60
        })

        return {
            status: 'SUCCESS',
            data: {
                accessToken: '',
                refreshToken: '',
                otpVerificationToken: '',
                signatureVerificationToken: verificationToken,
                status: FlowStatus.FS_CHALLENGE,
                challenge: { nonce, message: 'Omega Labs' }
            }
        }
    } catch (err: any) {
        return {
            status: 'ERROR',
            error: err
        }
    }
}

export const verifyWalletHandler = async ({ input, ctx: { req, res } }: { input: WalletSignatureInput; ctx: Context }) => {
    try {
        const { signature, verificationToken } = input
        if (!signature) {
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Invalid signature'
            })
        }
        const decodedToken = decodeJwtToken<{ metadata: MetadataToken }>(verificationToken)
        if (
            !verificationToken ||
            !decodedToken ||
            (decodedToken?.metadata && !decodedToken?.metadata.roles.includes(TokenRole.TR_WALLET_VERIFY))
        ) {
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Invalid verificationToken'
            })
        }
        const decoded = verifyJwt<{
            metadata: { id: string; networkSymbol: NetworkSymbol; walletAddress: string; walletProvider: WalletProviderLogin }
        }>(verificationToken, 'pubVerificationToken')
        if (!decoded)
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Invalid verification token'
            })

        const {
            metadata: { networkSymbol, walletAddress, walletProvider }
        } = decoded

        const user = await findWalletUser({
            walletAddress,
            networkSymbol: networkSymbol as NetworkSymbol,
            walletProvider: walletProvider as WalletProviderLogin
        })
        if (!user) {
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Invalid account'
            })
        }

        const nonce = await redisClient.get(`${walletAddress}-${networkSymbol}-${walletProvider}-nonce`)
        if (!nonce)
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Invalid nonce'
            })
        const verifyMessageValid = await verifyMessage({ nonce, address: walletAddress, signature })
        if (!verifyMessageValid)
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Failed to verify message'
            })

        const { accessToken, refreshToken } = await signTokens(decoded.metadata)
        storeCookieHandler(req, res, accessToken, refreshToken)

        return {
            status: 'SUCCESS',
            data: {
                accessToken,
                refreshToken,
                otpVerificationToken: '',
                signatureVerificationToken: '',
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
