import { trpc } from '@/lib/trpc'

export function useSites() {
  return trpc.site.list.useQuery()
}
