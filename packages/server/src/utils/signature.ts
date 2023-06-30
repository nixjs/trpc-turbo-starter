import { ethers } from 'ethers'
import { randomString } from './randomize'

export const createNonce = () => randomString()

export const verifyMessage = async ({ nonce, address, signature }: { nonce: string; address: string; signature: string }) => {
    try {
        const signerAddr = await ethers.utils.verifyMessage(nonce, signature)
        if (signerAddr !== address) {
            return false
        }
        return true
    } catch (err) {
        return false
    }
}
