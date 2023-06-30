import { initTRPC, TRPCError } from '@trpc/server'
import connectDB from '@trpc-turbo/db'
import superjson from 'superjson'
import { Context } from './createContext'

// Connect to Prisma
connectDB()

export const t = initTRPC.context<Context>().create({
    isServer: true,
    transformer: superjson
})

const isAuthed = t.middleware(({ next, ctx }) => {
    if (!ctx.user) {
        throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to access this resource'
        })
    }
    return next()
})

export const protectedProcedure = t.procedure.use(isAuthed)
