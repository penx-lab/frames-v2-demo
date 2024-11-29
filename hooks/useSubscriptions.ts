import { useSpaceContext } from '@/components/SpaceContext'
import { Subscription } from '@/domains/Subscription'
import { spaceAbi } from '@/lib/abi'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'

export function useSubscriptions() {
  const space = useSpaceContext()
  const { data = [], ...rest } = useReadContract({
    address: space.address as Address,
    abi: spaceAbi,
    functionName: 'getSubscriptions',
  })
  const subscriptions = data.map((raw) => new Subscription(raw))
  return {
    ...rest,
    data,
    subscriptions,
    subscription: subscriptions?.[0] as Subscription,
  }
}
