import { useSpaceContext } from '@/components/SpaceContext'
import { Plan, PlanInfo } from '@/domains/Plan'
import { spaceAbi } from '@/lib/abi'
import { IPFS_GATEWAY } from '@/lib/constants'
import { isIPFSCID } from '@/lib/utils'
import { wagmiConfig } from '@/lib/wagmi'
import { useQuery } from '@tanstack/react-query'
import { readContracts } from '@wagmi/core'
import ky from 'ky'

export function usePlans() {
  const space = useSpaceContext()
  const { data: plans = [], ...rest } = useQuery({
    queryKey: ['plans', space?.address],
    queryFn: async () => {
      const [token, plansRes] = await readContracts(wagmiConfig, {
        contracts: [
          {
            address: space?.address,
            abi: spaceAbi,
            functionName: 'token',
          },
          {
            address: space?.address,
            abi: spaceAbi,
            functionName: 'getPlans',
          },
        ],
        allowFailure: false,
      })

      const planInfos = await Promise.all(
        plansRes
          .filter((plan) => isIPFSCID(plan.uri))
          .map((plan) =>
            ky.get(`${IPFS_GATEWAY}/ipfs/${plan.uri}`).json<PlanInfo>(),
          ),
      )

      const plans: Plan[] = plansRes.map(
        (item, index) =>
          new Plan(
            index,
            { ...item, ...planInfos[index] },
            token[0],
            token[1],
            token[2],
          ),
      )

      return plans
    },
    enabled: !!space?.address,
  })

  return { plans, ...rest }
}
