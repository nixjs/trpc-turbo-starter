import { TRPCError } from '@trpc/server'
import { Interfaces, Types } from '@nixjs23n6/types'
import { User, UserWallet, UserSocial } from '@trpc-turbo/db'
import type { Context } from '../createContext'
import { UserInfoReply } from '../model/user'
import { LoginKind } from '../model/auth/enum'

export const getMeHandler = ({ ctx }: { ctx: Context }): Interfaces.ResponseData<UserInfoReply> => {
    try {
        const user = ctx.user
        let internal: Types.Undefined<Pick<User, 'name' | 'email'> & { userId: string }> = undefined
        let wallets: Pick<UserWallet, 'userId' | 'walletAddress' | 'networkSymbol' | 'walletProvider'>[] = []
        let socials: (Pick<UserSocial, 'socialProvider'> & { email: string; name: string; userId: string })[] = []
        const { id, email, name, accountSocials, accountWallets } = user as User & {
            accountSocials?: UserSocial[]
            accountWallets?: UserWallet[]
        }
        if (user?.kind === LoginKind.LK_INTERNAL) {
            internal = { userId: id, email, name }
        }
        if (user?.kind === LoginKind.LK_WALLET && accountWallets) {
            wallets = accountWallets.map(({ networkSymbol, userId, walletAddress, walletProvider }) => ({
                networkSymbol,
                userId,
                walletAddress,
                walletProvider
            }))
        }
        if (user?.kind === LoginKind.LK_SOCIAL && accountSocials) {
            socials = accountSocials.map(({ socialProvider, userId }) => ({ socialProvider, email: email || '', name: name || '', userId }))
        }
        return {
            status: 'SUCCESS',
            data: {
                internal,
                wallets,
                socials
            }
        }
    } catch (err: any) {
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: err.message
        })
    }
}
