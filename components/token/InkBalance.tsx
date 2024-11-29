'use client'

import { precision } from '@/lib/math'
import { Skeleton } from '../ui/skeleton'
import { useInkBalance } from './hooks/useInkBalance'

export const InkBalance = () => {
  const { isLoading, data } = useInkBalance()
  if (isLoading) return <Skeleton></Skeleton>
  return (
    <div className="flex items-center gap-1">
      <span className="i-[iconoir--wallet-solid] w-5 h-5 bg-foreground/40"></span>
      <div className="text-sm text-foreground/50">
        {precision.toDecimal(data!).toFixed(4)}
      </div>
    </div>
  )
}
