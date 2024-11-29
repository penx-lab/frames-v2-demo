import { trpc } from '@/lib/trpc'
import { useSession } from 'next-auth/react'

export function useSite() {
  const { data: session } = useSession()
  const { data: site, ...rest } = trpc.site.bySubdomain.useQuery(
    session?.domain?.domain!,
    {
      enabled: !!session?.domain,
    },
  )
  return { site: site!, ...rest }
}
