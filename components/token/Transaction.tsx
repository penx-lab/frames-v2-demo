'use client'

import { useState } from 'react'
import { useEthBalance, useQueryEthBalance } from '@/hooks/useEthBalance'
import { penTokenAbi } from '@/lib/abi'
import { addressMap } from '@/lib/address'
import { extractErrorMessage } from '@/lib/extractErrorMessage'
import { precision } from '@/lib/math'
import { wagmiConfig } from '@/lib/wagmi'
import { waitForTransactionReceipt } from '@wagmi/core'
import { toast } from 'sonner'
import { useAccount, useBalance, useWriteContract } from 'wagmi'
import LoadingDots from '../icons/loading-dots'
import { useInkBalance } from './hooks/useInkBalance'
import { useQueryXYK, useXYK } from './hooks/useXYK'
import { MintButton } from './MintButton'
import { TokenInput } from './TokenInput'
import { TokenOut } from './TokenOut'
import { TokenProgress } from './TokenProgress'

function getTokenAmount(x: bigint, y: bigint, k: bigint, amount: string) {
  const ethAmount = precision.token(amount)
  const newY = y - k / (x + ethAmount)
  return newY
}

export const Transaction = () => {
  useQueryEthBalance()
  const { refetch } = useQueryXYK()
  const { x, y, k } = useXYK()
  const { ethBalance } = useEthBalance()
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { isConnected } = useAccount()
  const { writeContractAsync } = useWriteContract()
  const eth = useQueryEthBalance()
  const inkBalance = useInkBalance()

  const onMint = async () => {
    setIsLoading(true)
    try {
      const hash = await writeContractAsync({
        address: addressMap.PenToken,
        abi: penTokenAbi,
        functionName: 'sponsor',
        value: precision.token(input),
      })

      await waitForTransactionReceipt(wagmiConfig, { hash })
      setInput('')
      setOutput('')
      inkBalance.refetch()
      eth.refetch()
      toast.success('Sponsor PenX successfully!')
    } catch (error) {
      const msg = extractErrorMessage(error)
      toast.error(msg || 'Failed to sponsor')
    }
    setIsLoading(false)
  }

  const isInsufficient = Number(input) > ethBalance.valueDecimal
  const btnText = isInsufficient ? 'Insufficient balance' : 'Sponsor'

  return (
    <div className="rounded-lg">
      <TokenInput
        value={input}
        onChange={(v) => {
          setInput(v)
          if (v) {
            const newY = getTokenAmount(x, y, k, v)
            setOutput(precision.toDecimal(newY).toFixed(4))
          } else {
            setOutput('')
          }
        }}
      />
      <TokenOut value={output} />
      <MintButton
        isConnected={isConnected}
        isLoading={isLoading}
        disabled={!input || isInsufficient || Number(input) === 0}
        onMint={onMint}
        // handleSwap={() => {
        //   setEthAmount('')
        //   setPurchasedAmount('')
        // }}
        // isInsufficientBalance={isInsufficientBalance}
        // isAmountValid={isAmountValid}
      >
        {isLoading ? <LoadingDots /> : btnText}
      </MintButton>
      <TokenProgress />
    </div>
  )
}
