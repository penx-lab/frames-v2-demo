import { frameConnector } from '@/lib/connector'
import { trpc, trpcClient } from '@/lib/trpc'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider } from 'next-auth/react'
import { createConfig, http, WagmiProvider } from 'wagmi'
import { base } from 'wagmi/chains'

export const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
  connectors: [frameConnector()],
})

const queryClient = new QueryClient()

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchInterval={0}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </WagmiProvider>
      </trpc.Provider>
    </SessionProvider>
  )
}
