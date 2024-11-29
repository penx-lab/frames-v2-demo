'use client'

import { trpc } from '@/lib/trpc'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '../ui/button'

export function SiteList() {
  const { data = [], isLoading } = trpc.site.list.useQuery()
  if (isLoading) return <div>Loading...</div>

  console.log('site====:', data)

  return (
    <div className="flex flex-col gap-2">
      {data.map((site) => (
        <Link
          href="/site"
          key={site.id}
          className="border-b border-foreground/5 py-3 space-y-2"
        >
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              <Image
                src={site.logo || ''}
                width={160}
                height={160}
                alt=""
                className="rounded-lg w-12 h-12"
              />
              <div>
                <div>{site.name}</div>
                <div className="text-sm text-foreground/60">
                  {site.description}
                </div>
              </div>
            </div>
            <Button
              size="sm"
              variant="secondary"
              className="text-xs text-foreground/80"
            >
              View garden
            </Button>
          </div>
          <div className="flex justify-between text-foreground/60 text-sm">
            <div>${site.name.toUpperCase()}</div>
            <div>8 Members</div>
            <div>TVL 10.334 ETH</div>
          </div>
        </Link>
      ))}
    </div>
  )
}
