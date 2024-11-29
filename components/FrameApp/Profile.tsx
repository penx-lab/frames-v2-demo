'use client'

import { Avatar, AvatarImage } from '../ui/avatar'
import { useFrameContext } from './FrameProvider'

export function Profile() {
  const { user } = useFrameContext()

  console.log('===user:', user)

  return (
    <div className="flex items-center gap-2">
      <Avatar>
        <AvatarImage src={user?.pfpUrl} />
      </Avatar>
      <div className="space-y-1 leading-none">
        <div className="text-lg leading-none font-bold">{user?.displayName}</div>
        <div className="text-sm leading-none text-foreground/60">@{user?.username}</div>
      </div>
    </div>
  )
}
