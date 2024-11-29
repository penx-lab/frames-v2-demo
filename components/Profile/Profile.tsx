'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useAccount } from 'wagmi'
import LoginButton from '../LoginButton'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { Button } from '../ui/button'
import { ProfileDialog } from './ProfileDialog/ProfileDialog'
import { ProfilePopover } from './ProfilePopover'

interface Props {}

export function Profile({}: Props) {
  const { data, status } = useSession()
  const { address = '' } = useAccount()

  if (status === 'loading')
    return (
      <Avatar className="h-8 w-8">
        <AvatarFallback></AvatarFallback>
      </Avatar>
    )

  const authenticated = !!data

  return (
    <>
      <ProfileDialog />
      {!authenticated && <LoginButton />}
      {authenticated && (
        <>
          <Link href="/~/objects/today">
            <Button size="sm">Dashboard</Button>
          </Link>
          <ProfilePopover />
        </>
      )}
    </>
  )
}
