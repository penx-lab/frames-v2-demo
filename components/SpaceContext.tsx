'use client'

import { createContext, PropsWithChildren, useContext, useEffect } from 'react'
import { Space } from '@/domains/Space'
import { SpaceType } from '@/lib/types'
import { Site } from '@penxio/types'

export const SpaceContext = createContext({} as Space)

interface Props {
  space: SpaceType
  site: Site
}

export const SpaceProvider = ({
  space,
  site,
  children,
}: PropsWithChildren<Props>) => {
  useEffect(() => {
    window.__SITE__ = site
  }, [site])
  return (
    <SpaceContext.Provider value={new Space(space)}>
      {children}
    </SpaceContext.Provider>
  )
}

export function useSpaceContext() {
  return useContext(SpaceContext)
}