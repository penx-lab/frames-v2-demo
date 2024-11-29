'use client'

import { useEthBalance } from '@/hooks/useEthBalance'
import { precision } from '@/lib/math'
import { Skeleton } from '../ui/skeleton'
import { useInkBalance } from './hooks/useInkBalance'

export const EthBalance = () => {
  const { ethBalance } = useEthBalance()
  if (!ethBalance.valueDecimal) return <Skeleton></Skeleton>
  return (
    <div className="flex items-center gap-1">
      <span className="i-[iconoir--wallet-solid] w-5 h-5 bg-foreground/40"></span>
      <div className="text-sm text-foreground/50">
        {ethBalance.valueFormatted}
      </div>
    </div>
  )
}
