'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useQueryEthBalance } from '@/hooks/useEthBalance'
import { useSpaceContext } from '../SpaceContext'
import { MemberForm } from './MemberForm'
import { useMemberDialog } from './useMemberDialog'

interface Props {}

export function MemberDialog({}: Props) {
  const { isOpen, setIsOpen } = useMemberDialog()
  const space = useSpaceContext()
  useQueryEthBalance()

  return (
    <Dialog open={isOpen} onOpenChange={(v) => setIsOpen(v)}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogDescription></DialogDescription>
        <DialogHeader>
          <DialogTitle>Subscription</DialogTitle>
          <div className="text-sm text-foreground/60">
            Subscribe to become a member of the{' '}
            <span className="font-bold">{space.name}</span> space.
          </div>
        </DialogHeader>
        <MemberForm space={space} />
      </DialogContent>
    </Dialog>
  )
}
