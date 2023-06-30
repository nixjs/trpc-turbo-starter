import { getFetch, httpBatchLink } from '@trpc/client'
import { createTRPCNext } from '@trpc/next'
import superjson from 'superjson'
import { AppRouter } from '@trpc-turbo/server'

function getBaseUrl() {
    if (typeof window !== 'undefined')
        // browser should use relative path
        return ''
    if (process.env.VERCEL_URL)
        // reference for vercel.com
        return `https://${process.env.VERCEL_URL}`
    // assume localhost
    return `http://localhost:${process.env.PORT ?? 3000}`
}

const prefixUrl = '/api/trpc'

export const trpc = createTRPCNext<AppRouter>({
    config({ ctx }) {
        if (typeof window !== 'undefined') {
            return {
                transformer: superjson,
                links: [
                    httpBatchLink({
                        url: prefixUrl
                    })
                ]
            }
        }

        return {
            queryClientConfig: {
                defaultOptions: {
                    queries: {
                        staleTime: 5 * 1000
                    }
                }
            },
            headers() {
                if (ctx?.req) {
                    return {
                        ...ctx.req.headers,
                        'x-ssr': '1'
                    }
                }
                return {}
            },
            links: [
                httpBatchLink({
                    url: `${getBaseUrl}/${prefixUrl}`,
                    fetch: async (input, init?) => {
                        const fetch = getFetch()
                        return fetch(input, {
                            ...init,
                            credentials: 'include'
                        })
                    }
                })
            ],
            transformer: superjson
        }
    },
    ssr: true
})
