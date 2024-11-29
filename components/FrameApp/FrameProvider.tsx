'use client'

import { createContext, PropsWithChildren, useContext } from 'react'
import sdk, { FrameContext as FrameContextType } from '@farcaster/frame-sdk'
import { useQuery } from '@tanstack/react-query'

export const FrameContext = createContext({} as FrameContextType)

const defaultUser = {
  user: {
    fallback: true,
    fid: 788144,
    username: '0xzion',
    displayName: '0xZio',
    pfpUrl:
      'https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/fcb2ff4b-a409-459b-a55f-306e8101b400/original',
    location: { placeId: '', description: '' },
  },
} as any as FrameContextType

interface Props {}

export const FrameProvider = ({ children }: PropsWithChildren<Props>) => {
  const { data, isLoading } = useQuery({
    queryKey: ['frame-context'],
    queryFn: async () => {
      try {
        const context = await sdk.context
        await sdk.actions.ready()
        console.log('========context:', context)

        return context || defaultUser
      } catch (error) {
        console.log('error:', error)
        return defaultUser
      }
    },
  })

  if (isLoading) return null

  return (
    <FrameContext.Provider value={data as any}>
      {children}
    </FrameContext.Provider>
  )
}

export function useFrameContext() {
  return useContext(FrameContext)
}
