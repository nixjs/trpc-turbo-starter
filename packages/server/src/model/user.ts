import { User, UserSocial, UserWallet } from '@trpc-turbo/db'

export interface UserInfoReply {
    internal?: Pick<User, 'name' | 'email'> & { userId: string }
    wallets: Pick<UserWallet, 'userId' | 'walletAddress' | 'networkSymbol' | 'walletProvider'>[]
    socials: (Pick<UserSocial, 'socialProvider'> & { email: string; name: string; userId: string })[]
}
