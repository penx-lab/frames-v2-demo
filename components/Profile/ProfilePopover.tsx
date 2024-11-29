'use client'

import { memo } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ROOT_DOMAIN } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useSignIn } from '@farcaster/auth-kit'
import { AuthType } from '@prisma/client'
import {
  DatabaseBackup,
  FileText,
  Gauge,
  Home,
  KeySquare,
  LogOut,
  Settings,
  UserCog,
  UserRound,
  Wallet,
} from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import { useSiteContext } from '../SiteContext'
import { Skeleton } from '../ui/skeleton'
import { ProfileAvatar } from './ProfileAvatar'
import { WalletInfo } from './WalletInfo'

interface Props {
  className?: string
  showAddress?: boolean
  showEnsName?: boolean
  showDropIcon?: boolean
}

export const ProfilePopover = memo(function ProfilePopover({
  showAddress,
  showEnsName,
  showDropIcon = false,
  className = '',
}: Props) {
  const { data } = useSession()
  const { push } = useRouter()
  const sigInState = useSignIn({})
  const pathname = usePathname()

  if (!data) return <div></div>

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <ProfileAvatar
          showAddress={showAddress}
          showEnsName={showEnsName}
          showDropIcon={showDropIcon}
          image={data.user?.image || ''}
          className={cn('cursor-pointer', className)}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="grid gap-2">
          <ProfileAvatar
            showAddress
            showEnsName
            showCopy
            image={data.user?.image || ''}
          />
          {data.address && <WalletInfo />}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          {/* <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => {
              push('/wallet')
            }}
          >
            <Wallet className="mr-2 h-4 w-4" />
            <span>Wallet</span>
          </DropdownMenuItem> */}

          {pathname !== '/' && (
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => {
                push('/')
              }}
            >
              <Home className="mr-2 h-4 w-4" />
              <span>Home</span>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => {
              const path = '/~/objects/today'
              if (location.host === ROOT_DOMAIN) {
                push(path)
                return
              }
              location.href = `${location.protocol}//${ROOT_DOMAIN}${path}`
            }}
          >
            <Gauge className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => {
              const path = '/~/settings'
              if (location.host === ROOT_DOMAIN) {
                push(path)
                return
              }
              location.href = `${location.protocol}//${ROOT_DOMAIN}${path}`
            }}
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>

          {/* <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => {
                  push('/~/access-token')
                }}
              >
                <KeySquare className="mr-2 h-4 w-4" />
                <span>Access Token</span>
              </DropdownMenuItem> */}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={async () => {
            try {
              await signOut()
              sigInState?.signOut()
              push('/')
            } catch (error) {}
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
})
