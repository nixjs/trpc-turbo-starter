import { object } from 'zod'
import { protectedProcedure, t } from '../createRouter'
import { getMeHandler } from '../controllers/user'

const userRouter = t.router({
    userInfo: protectedProcedure.input(object({})).query(({ ctx }) => getMeHandler({ ctx }))
})

export default userRouter
