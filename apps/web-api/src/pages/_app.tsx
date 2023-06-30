import 'styles/globals.css'
import type { NextPage } from 'next'
import type { AppType, AppProps } from 'next/app'
import type { ReactElement, ReactNode } from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { Web3Modal } from '@web3modal/react'
import { configureChains, createConfig, WagmiConfig } from 'wagmi'
import { bscTestnet, goerli, sepolia } from 'wagmi/chains'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { CookiesProvider } from 'react-cookie'
import { Toaster } from 'react-hot-toast'
import { DefaultLayout } from 'components/Layout'
import { trpc } from '../client/utils/trpc'
import { Config } from '../client/configs/env'

export type NextPageWithLayout<TProps = Record<string, unknown>, TInitialProps = TProps> = NextPage<TProps, TInitialProps> & {
    getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
    Component: NextPageWithLayout
}

const chains = [bscTestnet, goerli, sepolia]
const WALLET_CONNECT_ID = 'd63ec6568639530ceb4390941c3be866'
const { publicClient } = configureChains(chains, [w3mProvider({ projectId: WALLET_CONNECT_ID })])
const wagmiConfig = createConfig({
    autoConnect: true,
    connectors: w3mConnectors({ projectId: WALLET_CONNECT_ID, chains }),
    publicClient
})
const ethereumClient = new EthereumClient(wagmiConfig, chains)

const App = (({ Component, pageProps }: AppPropsWithLayout) => {
    const getLayout = Component.getLayout ?? ((page) => <DefaultLayout>{page}</DefaultLayout>)

    return (
        <CookiesProvider>
            <GoogleOAuthProvider clientId={Config.AUTH_GOOGLE_CLIENT_ID}>
                <WagmiConfig config={wagmiConfig}>
                    {getLayout(<Component {...pageProps} />)}
                    <ReactQueryDevtools initialIsOpen={false} />
                    <Toaster />
                </WagmiConfig>
            </GoogleOAuthProvider>
            <Web3Modal
                projectId={WALLET_CONNECT_ID}
                ethereumClient={ethereumClient}
                themeVariables={{
                    '--w3m-font-family': 'Inter',
                    '--w3m-background-color': '#035e5e',
                    '--w3m-accent-color': '#035e5e'
                }}
            />
        </CookiesProvider>
    )
}) as AppType

export default trpc.withTRPC(App)
