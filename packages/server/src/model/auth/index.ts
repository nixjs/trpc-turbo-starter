import { FlowStatus, LoginKind, TokenRole } from './enum'

export interface SecurityChallenge {
    message: string
    nonce: string
}

export interface MetadataToken {
    id: string
    kind: LoginKind
    roles: TokenRole[]
    [name: string]: any
}

export type PrivateKeyType = 'pkAccessToken' | 'pkRefreshToken' | 'pkVerificationToken'
export type PublicKeyType = 'pubAccessToken' | 'pubRefreshToken' | 'pubVerificationToken'
export interface JwtConfig {
    port: number
    accessTokenExpiresIn: number
    refreshTokenExpiresIn: number
    verificationTokeExpiresIn: number
    origin: string
    dbUri: string
    redisCacheExpiresIn: number
    redisUri: string

    pkAccessToken: string
    pubAccessToken: string
    pkRefreshToken: string
    pubRefreshToken: string
    pkVerificationToken: string
    pubVerificationToken: string

    googleClientId: string
    googleClientSecret: string
    appRedirectUri: string

    githubClientId: string
    githubClientSecret: string

    discordClientId: string
    discordClientSecret: string

    telegramClientId: string
    telegramClientSecret: string

    slackClientId: string
    slackClientSecret: string

    naclPairSecretKey: string
    naclPairPublicKey: string
}

export interface AuthReply {
    status: FlowStatus
    accessToken: string
    refreshToken: string
    signatureVerificationToken: string
    otpVerificationToken: string
    challenge?: SecurityChallenge
}
