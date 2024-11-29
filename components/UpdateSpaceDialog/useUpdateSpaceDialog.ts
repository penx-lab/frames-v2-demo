import { atom, useAtom } from 'jotai'

const updateSpaceDialogAtom = atom<boolean>(false)

export function useUpdateSpaceDialog() {
  const [isOpen, setIsOpen] = useAtom(updateSpaceDialogAtom)
  return { isOpen, setIsOpen }
}
