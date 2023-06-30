import { createClient } from 'redis'
import jwtConfig from '../config'

const redisClient = createClient({
    url: jwtConfig.redisUri
})

const connectRedis = async () => {
    try {
        await redisClient.connect()
        console.log('%cRedis client connected...', 'font-size: 18px;color:green')
        redisClient.set('tRPC', 'Welcome to tRPC with Next.js, Prisma and Typescript!')
    } catch (err: any) {
        console.log(err.message)
        process.exit(1)
    }
}

connectRedis()

redisClient.on('error', (err) => console.log(err))

export default redisClient
