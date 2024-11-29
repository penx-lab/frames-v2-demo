'use client'

import { PropsWithChildren } from 'react'
import LoadingDots from '../icons/loading-dots'
import { Button } from '../ui/button'
import { WalletConnectButton } from '../WalletConnectButton'

interface Props {
  onMint: () => void
  isLoading: boolean
  disabled: boolean
  isConnected: boolean
}

export const MintButton = ({
  isLoading,
  disabled,
  isConnected,
  onMint,
  children,
}: PropsWithChildren<Props>) => {
  return (
    <>
      {isConnected ? (
        <Button
          variant="brand"
          className="w-full h-[56px] rounded-2xl text-lg"
          disabled={isLoading || disabled}
          onClick={() => onMint()}
        >
          {children}
        </Button>
      ) : (
        <WalletConnectButton
          variant="brand"
          className="w-full h-[56px] rounded-2xl text-lg"
        >
          Connect wallet
        </WalletConnectButton>
      )}
    </>
  )
}
