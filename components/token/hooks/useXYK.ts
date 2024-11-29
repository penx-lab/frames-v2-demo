import { useEffect } from 'react'
import { penTokenAbi } from '@/lib/abi'
import { addressMap } from '@/lib/address'
import { atom, useAtom } from 'jotai'
import { useReadContracts } from 'wagmi'

const xykAtom = atom({
  x: BigInt(0),
  y: BigInt(0),
  k: BigInt(0),
})

export function useXYK() {
  const [state, setState] = useAtom(xykAtom)
  return {
    ...state,
    setState,
  }
}

export function useQueryXYK() {
  const { setState } = useXYK()
  const { data, ...rest } = useReadContracts({
    contracts: [
      {
        address: addressMap.PenToken,
        abi: penTokenAbi,
        functionName: 'x',
      },
      {
        address: addressMap.PenToken,
        abi: penTokenAbi,
        functionName: 'y',
      },
      {
        address: addressMap.PenToken,
        abi: penTokenAbi,
        functionName: 'k',
      },
    ],
  })

  useEffect(() => {
    if (!data) return
    const [{ result: x }, { result: y }, { result: k }] = data
    setState({ x: x!, y: y!, k: k! })
  }, [data, setState])

  return { data, ...rest }
}
