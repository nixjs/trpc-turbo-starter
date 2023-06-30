import { TRPCError } from '@trpc/server'
import bcrypt from 'bcryptjs'
import { Interfaces } from '@nixjs23n6/types'
import { AuthReply } from '@packages/server/model/auth'
import { FlowStatus } from '@packages/server/model/auth/enum'
import { Context } from '../createContext'
import { CreateUserInput, LoginUserInput } from '../schema/user.schema'
import { createUser, findUser, signTokens } from '../services/user'
import { storeCookieHandler } from './auth'

export const registerHandler = async ({ input }: { input: CreateUserInput }) => {
    try {
        const hashedPassword = await bcrypt.hash(input.password, 12)

        const user = await createUser({
            email: input.email,
            name: input.name,
            password: hashedPassword
        })

        return {
            status: 'success',
            data: {
                user
            }
        }
    } catch (err: any) {
        if (err.code === 'P2002') {
            throw new TRPCError({
                code: 'CONFLICT',
                message: 'Email already exists'
            })
        }
        throw err
    }
}

export const loginHandler = async ({
    input,
    ctx: { req, res }
}: {
    input: LoginUserInput
    ctx: Context
}): Promise<Interfaces.ResponseData<AuthReply>> => {
    try {
        const user = await findUser({ email: input.email })
        if (!user || !user.password || !(await bcrypt.compare(input.password, user.password))) {
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Invalid email or password'
            })
        }

        const { accessToken, refreshToken } = await signTokens(user)
        storeCookieHandler(req, res, accessToken, refreshToken)

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
