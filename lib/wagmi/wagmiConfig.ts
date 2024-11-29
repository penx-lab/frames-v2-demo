'use client'

import { frameConnector } from '@/lib/connector'
import { createConfig, http, WagmiProvider } from 'wagmi'
import { base, baseSepolia } from 'wagmi/chains'
import { NETWORK, NetworkNames, PROJECT_ID } from '../constants'

export function getChain() {
  if (NETWORK === NetworkNames.BASE_SEPOLIA) {
    return baseSepolia
  }
  return base
}

export const wagmiConfig = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
  connectors: [frameConnector()],
})
