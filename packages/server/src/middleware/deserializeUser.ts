import { TRPCError } from '@trpc/server'
import { User, UserWallet } from '@trpc-turbo/db'
import { NextApiRequest, NextApiResponse } from 'next'
import { findUniqueUser } from '../services/user'
import redisClient from '../utils/connectRedis'
import { verifyJwt } from '../utils/jwt'
import { MetadataToken } from '../model/auth'
import { LoginKind } from '../model/auth/enum'
import { Types } from '@nixjs23n6/types'

export const deserializeUser = async ({
    req,
    res
}: {
    req: NextApiRequest
    res: NextApiResponse
}): Promise<{ req: NextApiRequest; res: NextApiResponse; user: ((User | UserWallet) & { kind: LoginKind }) | null }> => {
    try {
        let accessToken: string | null = null
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            accessToken = req.headers.authorization.split(' ')[1]
        } else if (req.cookies.access_token) {
            accessToken = req.cookies.access_token
        }

        const notAuthenticated = {
            req,
            res,
            user: null
        }

        if (!accessToken) {
            return notAuthenticated
        }

        // Validate Access Token
        const decoded = verifyJwt<{ metadata: MetadataToken }>(accessToken, 'pubAccessToken')
        if (!decoded) {
            return notAuthenticated
        }

        // Check if user has a valid session
        const session = await redisClient.get(decoded.metadata.id)
        if (!session) {
            return notAuthenticated
        }

        const {
            metadata: { id, kind }
        } = JSON.parse(session) as { metadata: MetadataToken }

        const user: Types.Nullable<User> = await findUniqueUser(
            { id },
            {
                email: true,
                id: true,
                name: true,
                role: true,
                accountSocials: kind === LoginKind.LK_SOCIAL,
                accountWallets: kind === LoginKind.LK_WALLET
            }
        )

        if (!user) {
            return notAuthenticated
        }

        return {
            req,
            res,
            user: { ...user, id: user.id, kind }
        }
    } catch (err: any) {
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: err.message
        })
    }
}
