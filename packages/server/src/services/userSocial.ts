import { prisma, Prisma, SocialProviderLogin, UserSocial } from '@trpc-turbo/db'
import jwtConfig from '../config'
import { MetadataToken } from '../model/auth'
import { LoginKind, TokenRole } from '../model/auth/enum'
import redisClient from '../utils/connectRedis'
import { signJwtToken } from './auth'

export const createSocialUser = async (input: Prisma.UserSocialCreateInput) => {
    return (await prisma.userSocial.create({
        data: input
    })) as UserSocial
}

export const findSocialUser = async (where: Partial<Prisma.UserSocialWhereInput>, select?: Prisma.UserSocialSelect) => {
    return (await prisma.userSocial.findFirst({
        where,
        select
    })) as UserSocial
}

export const findSocialUniqueUser = async (where: Prisma.UserSocialWhereUniqueInput, select?: Prisma.UserSocialSelect) => {
    return (await prisma.userSocial.findUnique({
        where,
        include: {
            user: {
                select,
                include: {
                    accountSocials: true
                }
            }
        }
    })) as UserSocial
}

export const updateSocialUser = async (
    where: Partial<Prisma.UserWhereUniqueInput>,
    data: Prisma.UserUpdateInput,
    select?: Prisma.UserSocialSelect
) => {
    return (await prisma.userSocial.update({ where, data, select })) as UserSocial
}

export const signTokens = async (user: { id: string; socialProviderId: string; socialProvider: SocialProviderLogin }) => {
    const { id, socialProvider, socialProviderId } = user
    const metadata: MetadataToken = { id: id || '', socialProvider, socialProviderId, kind: LoginKind.LK_SOCIAL, roles: [] }
    redisClient.set(`${user.id}`, JSON.stringify({ metadata }), {
        EX: jwtConfig.redisCacheExpiresIn * 60
    })
    const accessToken = await signJwtToken('pkAccessToken', { ...metadata, roles: [TokenRole.TR_USER] }, jwtConfig.accessTokenExpiresIn)
    const refreshToken = await signJwtToken(
        'pkRefreshToken',
        { ...metadata, roles: [TokenRole.TR_REFRESH_TOKEN] },
        jwtConfig.refreshTokenExpiresIn
    )

    return { accessToken, refreshToken }
}
