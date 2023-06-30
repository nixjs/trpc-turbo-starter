import { object, string, TypeOf, number } from 'zod'

export const verifyTelegramSchema = object({
    id: number({ required_error: 'code is required' }),
    firstName: string({ required_error: 'provider is required' }),
    lastName: string().nullish(),
    userName: string({ required_error: 'provider is required' }),
    photoUrl: string({ required_error: 'provider is required' }),
    authDate: number({ required_error: 'code is required' }),
    hash: string({ required_error: 'provider is required' })
})

export const loginSocialUserSchema = object({
    code: string({ required_error: 'code is required' }),
    provider: string({ required_error: 'provider is required' }),
    telegramData: verifyTelegramSchema.nullish()
})

export type LoginSocialUserInput = TypeOf<typeof loginSocialUserSchema>
export type VerifyTelegramInput = TypeOf<typeof verifyTelegramSchema>
