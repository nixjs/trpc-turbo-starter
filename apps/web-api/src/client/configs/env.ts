export interface EnvName {
    DEVELOPMENT: string
    PRODUCTION: string
}

export const EnvNameConfig: EnvName = {
    DEVELOPMENT: 'dev',
    PRODUCTION: 'prod'
} as const

const env = process.env.APP_ENV

interface ConfigValue {
    AUTH_GOOGLE_CLIENT_ID: string
    AUTH_GITHUB_CLIENT_ID: string
    AUTH_DISCORD_CLIENT_ID: string
    AUTH_FACEBOOK_APP_ID: string
    AUTH_APPLE_CLIENT_ID: string
    AUTH_TELEGRAM_BOT: string
    AUTH_REDIRECT: string
}

export const Configs: Record<string, ConfigValue> = {
    [EnvNameConfig.DEVELOPMENT]: {
        AUTH_GOOGLE_CLIENT_ID: 'demo.apps.googleusercontent.com',
        AUTH_GITHUB_CLIENT_ID: 'f1b2f2193ee7aab340a7demo',
        AUTH_DISCORD_CLIENT_ID: '1123776201618632756demo',
        AUTH_FACEBOOK_APP_ID: '472886221541870demo',
        AUTH_APPLE_CLIENT_ID: 'demo',
        AUTH_TELEGRAM_BOT: 'demo_bot',
        AUTH_REDIRECT: 'http://localhost:3000'
    },
    [EnvNameConfig.PRODUCTION]: {
        AUTH_GOOGLE_CLIENT_ID: 'demo.apps.googleusercontent.com',
        AUTH_GITHUB_CLIENT_ID: 'f1b2f2193ee7aab340a7demo',
        AUTH_DISCORD_CLIENT_ID: '1123776201618632756demo',
        AUTH_FACEBOOK_APP_ID: '2814961075479938',
        AUTH_APPLE_CLIENT_ID: 'demo',
        AUTH_TELEGRAM_BOT: 'demo_bot',
        AUTH_REDIRECT: 'http://localhost:3000'
    }
}

export const Config = Configs[env as string] as ConfigValue
export default env
