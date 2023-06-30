import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { createTrackedSelector } from 'react-tracked'
import { SocialProviderLogin } from '@prisma/client'

interface State {
    socialProviderLogin: SocialProviderLogin
}

interface AuthState extends State {
    socialProviderLogin: SocialProviderLogin
    onSetSocialProviderLogin: (value: SocialProviderLogin) => void
    onResetState: () => void
}

const initialState: State = {
    socialProviderLogin: SocialProviderLogin.PL_NONE
}

export const useAuthStore = create<AuthState>()(
    devtools((set) => ({
        ...initialState,
        onSetSocialProviderLogin: (by) => set(() => ({ socialProviderLogin: by })),
        onResetState: () =>
            set(() => ({
                ...initialState
            }))
    }))
)

export const useAuthTrackedStore = createTrackedSelector(useAuthStore)
