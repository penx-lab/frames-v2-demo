'use client'

import { FrameProvider } from '@/components/FrameApp/FrameProvider'
import dynamic from 'next/dynamic'

const FrameApp = dynamic(() => import('@/components/FrameApp/FrameApp'), {
  ssr: false,
})

export default function App() {
  return <FrameApp />
}
