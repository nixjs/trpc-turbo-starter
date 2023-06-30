import { JwtConfig } from '../model/auth'

const jwtConfig: JwtConfig = {
    port: 8000,
    accessTokenExpiresIn: 15,
    refreshTokenExpiresIn: 60,
    verificationTokeExpiresIn: 15,
    origin: process.env.CLIENT_REDIRECT as string,
    redisCacheExpiresIn: 60,
    redisUri: process.env.REDIS_URI as string,

    dbUri: process.env.DATABASE_URL as string,
    pkAccessToken: process.env.ACCESS_TOKEN_PRIVATE_KEY as string,
    pubAccessToken: process.env.ACCESS_TOKEN_PUBLIC_KEY as string,
    pkRefreshToken: process.env.REFRESH_TOKEN_PRIVATE_KEY as string,
    pubRefreshToken: process.env.REFRESH_TOKEN_PUBLIC_KEY as string,
    pkVerificationToken: process.env.VERIFICATION_TOKEN_PRIVATE_KEY as string,
    pubVerificationToken: process.env.VERIFICATION_TOKEN_PUBLIC_KEY as string,
    appRedirectUri: process.env.CLIENT_REDIRECT as string,
    googleClientId: process.env.GOOGLE_CLIENT_ID as string,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    githubClientId: process.env.GITHUB_CLIENT_ID as string,
    githubClientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    discordClientId: process.env.DISCORD_CLIENT_ID as string,
    discordClientSecret: process.env.DISCORD_CLIENT_SECRET as string,
    telegramClientId: process.env.TELEGRAM_CLIENT_ID as string,
    telegramClientSecret: process.env.TELEGRAM_CLIENT_SECRET as string,
    slackClientId: process.env.SLACK_CLIENT_ID as string,
    slackClientSecret: process.env.SLACK_CLIENT_SECRET as string,

    naclPairSecretKey: process.env.NACL_PAIR_SECRET_KEY as string,
    naclPairPublicKey: process.env.NACL_PAIR_PUBLIC_KEY as string
}

export default jwtConfig
