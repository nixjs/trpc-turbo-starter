import { TRPCError } from '@trpc/server'
import { NextApiRequest, NextApiResponse } from 'next'
import { Interfaces } from '@nixjs23n6/types'
import { User } from '@trpc-turbo/db'
import { OptionsType } from 'cookies-next/lib/types'
import { getCookie, setCookie } from 'cookies-next'
import jwtConfig from '../config'
import { Context } from '../createContext'
import redisClient from '../utils/connectRedis'
import { signJwt, verifyJwt } from '../utils/jwt'
import { AuthReply, MetadataToken } from '../model/auth'
import { FlowStatus, TokenRole } from '../model/auth/enum'
import { findUser } from '../services/user'

// [...] Cookie options
const cookieOptions: OptionsType = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
}

export const accessTokenCookieOptions: OptionsType = {
    ...cookieOptions,
    expires: new Date(Date.now() + jwtConfig.accessTokenExpiresIn * 60 * 1000)
}

export const refreshTokenCookieOptions: OptionsType = {
    ...cookieOptions,
    expires: new Date(Date.now() + jwtConfig.refreshTokenExpiresIn * 60 * 1000)
}

export const storeCookieHandler = (req: NextApiRequest, res: NextApiResponse, accessToken: string, refreshToken: string) => {
    setCookie('access_token', accessToken, {
        req,
        res,
        ...accessTokenCookieOptions
    })
    setCookie('refresh_token', refreshToken, {
        req,
        res,
        ...refreshTokenCookieOptions
    })
    setCookie('logged_in', 'true', {
        req,
        res,
        ...accessTokenCookieOptions,
        httpOnly: false
    })
}

const logout = ({ ctx: { req, res } }: { ctx: Context }) => {
    setCookie('access_token', '', { req, res, maxAge: -1 })
    setCookie('refresh_token', '', { req, res, maxAge: -1 })
    setCookie('logged_in', '', { req, res, maxAge: -1 })
}

export const logoutHandler = async ({ ctx }: { ctx: Context }) => {
    try {
        const user = ctx.user
        await redisClient.del(String(user?.id))
        logout({ ctx })
        return { status: 'success' }
    } catch (err: any) {
        console.log(err)
        throw err
    }
}

export const refreshAccessTokenHandler = async ({ ctx: { req, res } }: { ctx: Context }): Promise<Interfaces.ResponseData<AuthReply>> => {
    try {
        // Get the refresh token from cookie
        const refresh_token = getCookie('refresh_token', { req, res }) as string

        const message = 'Could not refresh access token'
        if (!refresh_token) {
            throw new TRPCError({ code: 'FORBIDDEN', message })
        }

        // Validate the Refresh token
        const decoded = verifyJwt<{ metadata: MetadataToken }>(refresh_token, 'pubRefreshToken')

        if (!decoded) {
            throw new TRPCError({ code: 'FORBIDDEN', message })
        }

        // Check if the user has a valid session
        const session = await redisClient.get(decoded.metadata.id)
        if (!session) {
            throw new TRPCError({ code: 'FORBIDDEN', message })
        }

        if (!decoded.metadata.roles.includes(TokenRole.TR_REFRESH_TOKEN))
            throw new TRPCError({ code: 'FORBIDDEN', message: 'Invalid token. Refresh token must have a role: TR_REFRESH_TOKEN' })

        const user: User = await findUser({ id: JSON.parse(session).id }, {})

        if (!user) {
            throw new TRPCError({ code: 'FORBIDDEN', message })
        }

        // Sign new access token
        const accessToken = signJwt({ sub: user.id }, 'pkAccessToken', {
            expiresIn: `${jwtConfig.accessTokenExpiresIn}m`
        })

        const refreshToken = signJwt({ sub: user.id }, 'pkRefreshToken', {
            expiresIn: `${jwtConfig.refreshTokenExpiresIn}m`
        })

        // Send the access token as cookie
        setCookie('access_token', accessToken, {
            req,
            res,
            ...accessTokenCookieOptions
        })
        setCookie('refresh_token', refreshToken, {
            req,
            res,
            ...refreshTokenCookieOptions
        })
        setCookie('logged_in', 'true', {
            req,
            res,
            ...accessTokenCookieOptions,
            httpOnly: false
        })

        // Send response
        return {
            status: 'SUCCESS',
            data: {
                accessToken,
                refreshToken,
                status: FlowStatus.FS_COMPLETED,
                otpVerificationToken: '',
                signatureVerificationToken: ''
            }
        }
    } catch (err: any) {
        return {
            status: 'ERROR',
            error: err
        }
    }
}
