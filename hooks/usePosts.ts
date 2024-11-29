import { useSiteContext } from '@/components/SiteContext'
import { trpc } from '@/lib/trpc'
import { atom } from 'jotai'
import { Post } from './usePost'

export function usePosts() {
  const site = useSiteContext()
  return trpc.post.list.useQuery()
}
