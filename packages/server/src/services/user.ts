import { prisma, Prisma, User } from '@trpc-turbo/db'
import jwtConfig from '../config'
import redisClient from '../utils/connectRedis'
import { signJwtToken } from './auth'
import { LoginKind, TokenRole } from '../model/auth/enum'
import { MetadataToken } from '../model/auth'

export const createUser = async (input: Prisma.UserCreateInput) => {
    return (await prisma.user.create({
        data: input
    })) as User
}

export const findUser = async (where: Partial<Prisma.UserWhereInput>, select?: Prisma.UserSelect) => {
    return (await prisma.user.findFirst({
        where,
        select
    })) as User
}

export const findUniqueUser = async (where: Prisma.UserWhereUniqueInput, select?: Prisma.UserSelect) => {
    return (await prisma.user.findUnique({
        where,
        select
    })) as User
}

export const updateUser = async (where: Partial<Prisma.UserWhereUniqueInput>, data: Prisma.UserUpdateInput, select?: Prisma.UserSelect) => {
    return (await prisma.user.update({ where, data, select })) as User
}

export const signTokens = async (user: Prisma.UserCreateInput) => {
    const { id, name, email } = user
    const metadata: MetadataToken = { id: id || '', name, email, kind: LoginKind.LK_INTERNAL, roles: [] }
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
