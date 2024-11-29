'use client'

import { Bitcoin, Fan, Home, MessageCircle } from 'lucide-react'

export function SiteFooter() {
  return (
    <div className="h-14 sticky bottom-0 flex justify-center items-center border-t border-foreground/5">
      <div className="flex-1 flex flex-col items-center justify-center">
        <Home size={24} />
        <div className="text-xs">Creations</div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center">
        <Bitcoin size={24} />
        <div className="text-xs">Trade</div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center">
        <Fan size={24} />
        <div className="text-xs">Membership</div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center">
        <MessageCircle size={24} />
        <div className="text-xs">Chat</div>
      </div>
    </div>
  )
}
