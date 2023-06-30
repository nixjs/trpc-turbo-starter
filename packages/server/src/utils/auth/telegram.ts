import { sha256 } from '@noble/hashes/sha256'
import { bytesToHex as toHex } from '@noble/hashes/utils'
import { hmac } from '@noble/hashes/hmac'
import { VerifyTelegramInput } from '@packages/server/schema/userSocial.schema'
import jwtConfig from '../../config'
import { SocialInfo } from './types'

const whitelistParams = ['id', 'first_name', 'last_name', 'username', 'photo_url', 'auth_date']

interface TelegramUserData {
    id: number
    first_name: string
    last_name?: string
    username?: string
    photo_url?: string
    auth_date: number
    hash: string
}

export async function verifyTelegramAccount(payload: VerifyTelegramInput): Promise<SocialInfo> {
    const { authDate, firstName, hash, id, photoUrl, userName, lastName } = payload
    if (Number.isNaN(authDate) || ~~(Date.now() / 1000) - authDate >= 86400) throw new Error('The telegram input outdated')
    const usePayload: TelegramUserData = {
        id,
        first_name: firstName,
        last_name: lastName || undefined,
        username: userName,
        photo_url: photoUrl,
        auth_date: authDate,
        hash
    }
    const sorted = Object.keys(usePayload).sort()
    const mapped = sorted // Only whitelisted query parameters must be mapped
        .filter((d) => whitelistParams.includes(d) && typeof usePayload[d as keyof typeof usePayload] !== 'undefined')
        .map((key) => `${key}=${usePayload[key as keyof typeof usePayload]}`)

    const hashString = mapped.join('\n')
    // create a hash of a secret that both you and Telegram know. In this case, it is your bot token
    const secretKey = sha256.create().update(jwtConfig.telegramClientSecret).digest()
    // const secretKey = crypto.createHash('sha256').update(jwtConfig.telegramClientSecret).digest()
    // // run a cryptographic hash function over the data to be authenticated and the secret
    const checkHash = hmac.create(sha256, secretKey).update(hashString).digest()
    // const checkHash = crypto.createHmac('sha256', secretKey).update(hashString).digest('hex')
    if (toHex(checkHash) === hash)
        return {
            id: String(id),
            name: [firstName, lastName || ''].join(' '),
            avatar: photoUrl
        }
    throw new Error('Failed to verify telegram input')
}
