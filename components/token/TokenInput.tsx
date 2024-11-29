'use client'

import { useEthBalance } from '@/hooks/useEthBalance'
import { toFloorFixed } from '@/lib/utils'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { NumberInput } from '../NumberInput'
import { Button } from '../ui/button'
import { EthBalance } from './EthBalance'

interface Props {
  value: string
  onChange: (value: string) => void
}

export const TokenInput = ({ value, onChange }: Props) => {
  const { ethBalance } = useEthBalance()
  const { isConnected } = useAccount()
  const { openConnectModal } = useConnectModal()

  const setMax = () => {
    if (!isConnected) return openConnectModal?.()
    onChange(toFloorFixed(ethBalance.valueDecimal, 5).toString())
  }

  return (
    <div className="mb-2 bg-background dark:bg-foreground/5 rounded-2xl p-4 shadow h-[114px]">
      <div className="text-sm">Sponsor</div>
      <div className="flex font-[600] items-center gap-1">
        <NumberInput
          type="text"
          value={value}
          onChange={(value) => onChange(value)}
          placeholder="0.0"
          className="p-2 font-bold text-3xl pl-0 rounded w-full bg-transparent border-none focus:border-none outline-none focus-visible:ring-0 focus-visible:ring-transparent"
        />
        <img src="/eth.png" alt="ETH" className="w-[20px] h-auto" />
        <span className="text-lg ml-1 font-semibold">ETH</span>
      </div>
      <div className="flex justify-end items-center gap-1">
        <EthBalance />
        <Button
          // disabled={isConnected}
          onClick={setMax}
          className="h-6 px-2 rounded-full"
        >
          Max
        </Button>
      </div>
    </div>
  )
}
