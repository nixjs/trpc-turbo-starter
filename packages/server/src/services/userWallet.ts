import { NetworkSymbol, WalletProviderLogin, prisma, Prisma, UserWallet } from '@trpc-turbo/db'
import jwtConfig from '../config'
import redisClient from '../utils/connectRedis'
import { signJwtToken } from './auth'
import { LoginKind, TokenRole } from '../model/auth/enum'
import { MetadataToken } from '../model/auth'

export const createWalletUser = async (input: Prisma.UserWalletCreateInput) => {
    return (await prisma.userWallet.create({
        data: input
    })) as UserWallet
}

export const findWalletUser = async (where: Partial<Prisma.UserWalletWhereInput>, select?: Prisma.UserWalletSelect) => {
    return (await prisma.userWallet.findFirst({
        where,
        select
    })) as UserWallet
}

export const findWalletUniqueUser = async (where: Prisma.UserWalletWhereUniqueInput, select?: Prisma.UserWalletSelect) => {
    return (await prisma.userWallet.findUnique({
        where,
        include: {
            user: {
                select,
                include: {
                    accountWallets: true
                }
            }
        }
    })) as UserWallet
}

export const updateWalletUser = async (
    where: Partial<Prisma.UserWhereUniqueInput>,
    data: Prisma.UserUpdateInput,
    select?: Prisma.UserWalletSelect
) => {
    return (await prisma.userWallet.update({ where, data, select })) as UserWallet
}

export const signVerificationToken = async ({
    id,
    networkSymbol,
    walletAddress,
    walletProvider
}: {
    id: string
    walletAddress: string
    networkSymbol: NetworkSymbol
    walletProvider: WalletProviderLogin
}) => {
    const metadata: MetadataToken = { id: id, networkSymbol, walletAddress, walletProvider, kind: LoginKind.LK_WALLET, roles: [] }
    const verificationToken = await signJwtToken(
        'pkVerificationToken',
        { ...metadata, roles: [TokenRole.TR_WALLET_VERIFY] },
        jwtConfig.refreshTokenExpiresIn
    )
    return { verificationToken }
}

export const signTokens = async ({
    id,
    networkSymbol,
    walletAddress,
    walletProvider
}: {
    id: string
    walletAddress: string
    networkSymbol: NetworkSymbol
    walletProvider: WalletProviderLogin
}) => {
    const metadata: MetadataToken = {
        id,
        networkSymbol,
        walletAddress,
        walletProvider,
        kind: LoginKind.LK_WALLET,
        roles: []
    }
    redisClient.set(`${id}`, JSON.stringify({ metadata }), {
        EX: jwtConfig.redisCacheExpiresIn * 60
    })
    const accessToken = await signJwtToken(
        'pkAccessToken',
        { ...metadata, roles: [TokenRole.TR_USER_WALLET] },
        jwtConfig.accessTokenExpiresIn
    )
    const refreshToken = await signJwtToken(
        'pkRefreshToken',
        { ...metadata, roles: [TokenRole.TR_REFRESH_TOKEN] },
        jwtConfig.refreshTokenExpiresIn
    )

    return { accessToken, refreshToken }
}
