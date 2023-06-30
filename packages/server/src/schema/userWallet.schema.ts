import { object, string, TypeOf } from 'zod'

export const loginWalletUserSchema = object({
    walletAddress: string({ required_error: 'walletAddress is required' }),
    networkSymbol: string({ required_error: 'networkSymbol is required' }),
    provider: string({ required_error: 'provider is required' })
})

export const walletSignatureSchema = object({
    signature: string({ required_error: 'signature is required' }),
    verificationToken: string({ required_error: 'verificationToken is required' })
})

export type LoginWalletUserInput = TypeOf<typeof loginWalletUserSchema>
export type WalletSignatureInput = TypeOf<typeof walletSignatureSchema>
