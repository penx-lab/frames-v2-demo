'use client'

import { forwardRef } from 'react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useEthBalance } from '@/hooks/useEthBalance'
import { useTokenBalance } from '@/hooks/useTokenBalance'
import { precision } from '@/lib/math'
import { useSpaceContext } from '../SpaceContext'

interface Props {
  value: string
  onChange: (value: string) => void
}

export const TokenSelect = forwardRef<HTMLDivElement, Props>(
  function TokenSelect({ value, onChange }, ref) {
    const space = useSpaceContext()
    const { ethBalance } = useEthBalance()
    const { data } = useTokenBalance()
    const isEth = value === 'ETH'

    return (
      <div ref={ref} className="flex items-center">
        <div className="w-10">Use</div>
        <div className="flex-1">
          <ToggleGroup
            className="gap-3"
            value={value}
            onValueChange={(v) => {
              if (!v) return
              onChange(v)
            }}
            type="single"
          >
            <ToggleGroupItem
              className="data-[state=on]:bg-foreground data-[state=on]:text-background text-xs font-semibold rounded-full h-8 border"
              value="ETH"
            >
              <div>$ETH</div>
            </ToggleGroupItem>

            <ToggleGroupItem
              value="SPACE"
              className="data-[state=on]:bg-foreground data-[state=on]:text-background text-xs font-semibold rounded-full h-8 border"
            >
              <div>${space.symbolName}</div>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {isEth && (
          <div className="text-xs text-foreground/50">
            {ethBalance.valueDecimal.toFixed(5)} ETH
          </div>
        )}

        {typeof data !== 'undefined' && !isEth && (
          <div className="text-xs text-foreground/50">
            {precision.toDecimal(data).toFixed(2)} {space.symbolName}
          </div>
        )}
      </div>
    )
  },
)
