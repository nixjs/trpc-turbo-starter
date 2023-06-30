/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    env: {
        APP_ENV: process.env.APP_ENV
    },
    transpilePackages: ['@trpc-turbo/db', '@trpc-turbo/server', '@trpc-turbo/ui']
}

module.exports = nextConfig
