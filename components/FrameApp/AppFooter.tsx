'use client'

import { Button } from '../ui/button'

export function AppFooter() {
  return (
    <div className="h-16 sticky bottom-0 flex justify-center items-center">
      <Button size="lg" variant="brand" className="rounded-full shadow-md">
        Create my garden
      </Button>
    </div>
  )
}
