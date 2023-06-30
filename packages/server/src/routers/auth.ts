import { t } from '../createRouter'
import { logoutHandler, refreshAccessTokenHandler } from '../controllers/auth'
import { loginHandler, registerHandler } from '../controllers/auth.user'
import { loginHandler as loginWalletHandler, verifyWalletHandler } from '../controllers/auth.wallet'
import { loginHandler as loginSocialHandler } from '../controllers/auth.social'
import { createUserSchema, loginUserSchema } from '../schema/user.schema'
import { loginWalletUserSchema, walletSignatureSchema } from '../schema/userWallet.schema'
import { loginSocialUserSchema } from '../schema/userSocial.schema'

const authRouter = t.router({
    register: t.procedure.input(createUserSchema).mutation(({ input }) => registerHandler({ input })),
    login: t.procedure.input(loginUserSchema).mutation(({ input, ctx }) => loginHandler({ input, ctx })),
    loginWallet: t.procedure.input(loginWalletUserSchema).mutation(({ input, ctx }) => loginWalletHandler({ input, ctx })),
    verifyWallet: t.procedure.input(walletSignatureSchema).mutation(({ input, ctx }) => verifyWalletHandler({ input, ctx })),
    loginSocial: t.procedure.input(loginSocialUserSchema).mutation(({ input, ctx }) => loginSocialHandler({ input, ctx })),
    logout: t.procedure.mutation(({ ctx }) => logoutHandler({ ctx })),
    refreshToken: t.procedure.query(({ ctx }) => refreshAccessTokenHandler({ ctx }))
})

export default authRouter
