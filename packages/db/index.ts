import { PrismaClient } from '@prisma/client'

export * from '@prisma/client'

const globalForPrisma = globalThis as { prisma?: PrismaClient }

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
    })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

async function connectDB() {
    try {
        await prisma.$connect()
        console.log('%cDatabase connected successfully', 'font-size: 18px;color:green')
    } catch (error) {
        console.log(error)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

export default connectDB
