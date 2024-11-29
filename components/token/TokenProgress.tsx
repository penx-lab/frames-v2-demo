'use client'

import { PropsWithChildren, useEffect, useState } from 'react'
import { Progress } from '@/components/ui/progress'
import { penTokenAbi } from '@/lib/abi'
import { addressMap } from '@/lib/address'
import { precision } from '@/lib/math'
import { useReadContract } from 'wagmi'

interface Props {}

export const TokenProgress = ({}: PropsWithChildren<Props>) => {
  const MAX_SUPPLY = 3_000_000_000
  const { data, isLoading } = useReadContract({
    address: addressMap.PenToken,
    abi: penTokenAbi,
    functionName: 'sponsoredAmount',
  })

  const [progress, setProgress] = useState(0)
  useEffect(() => {
    if (data) {
      setProgress(precision.toDecimal(data))
    }
  }, [data])

  if (isLoading) return null

  return (
    <div className="mt-4">
      <Progress
        max={MAX_SUPPLY}
        value={progress}
        className="bg-background shadow-sm"
      />
      <div className="flex text-foreground/40 text-xs mt-1 justify-between">
        <div>Sponsored amount: {precision.toDecimal(data!).toFixed(0)}</div>
        <div className="text-center">Sponsor supply: 3000000000 (300ETH)</div>
      </div>
    </div>
  )
}
