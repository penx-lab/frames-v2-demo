'use client'

import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { FileUpload } from '@/components/FileUpload'
import LoadingDots from '@/components/icons/loading-dots'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Space } from '@/domains/Space'
import { useAddress } from '@/hooks/useAddress'
import { spaceAtom } from '@/hooks/useSpace'
// import { updateSpaceById } from '@/hooks/useSpaces'
import { spaceAbi } from '@/lib/abi'
import { addToIpfs } from '@/lib/addToIpfs'
import { editorDefaultValue } from '@/lib/constants'
import { extractErrorMessage } from '@/lib/extractErrorMessage'
import { revalidateMetadata } from '@/lib/revalidateTag'
import { api } from '@/lib/trpc'
import { wagmiConfig } from '@/lib/wagmi'
import { store } from '@/store'
import { zodResolver } from '@hookform/resolvers/zod'
import { waitForTransactionReceipt, writeContract } from '@wagmi/core'
import { toast } from 'sonner'
import { z } from 'zod'
import { PlateEditor } from '../editor/plate-editor'
import { useSpaceContext } from '../SpaceContext'
import { useUpdateSpaceDialog } from './useUpdateSpaceDialog'

const FormSchema = z.object({
  logo: z.string().min(1, {
    message: 'Logo is required.',
  }),

  name: z.string().min(1, {
    message: 'Name must be at least 1 characters.',
  }),

  description: z.string(),
  about: z.string(),
})

export function UpdateSpaceForm() {
  const space = useSpaceContext()
  const { setIsOpen } = useUpdateSpaceDialog()
  const [loading, setLoading] = useState(false)

  const about = useMemo(() => {
    try {
      JSON.parse(space.about)
      return space.about
    } catch (error) {
      return JSON.stringify(editorDefaultValue)
    }
  }, [space.about])

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      logo: space.logo,
      name: space.name!,
      description: space.description!,
      // about: space.about,
      about,
    },
  })

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log('===data:', data)

    try {
      setLoading(true)
      // console.log('data:', data)

      const res = await fetch(`/api/ipfs-add?address=${space.address}`, {
        method: 'POST',
        body: JSON.stringify({
          ...space.spaceInfo,
          ...data,
          logo: data.logo.split('/').pop(),
        }),
        headers: { 'Content-Type': 'application/json' },
      }).then((d) => d.json())

      const hash = await writeContract(wagmiConfig, {
        address: space.address,
        abi: spaceAbi,
        functionName: 'updateConfig',
        args: [res.cid, space.stakingRevenuePercent],
      })

      await waitForTransactionReceipt(wagmiConfig, { hash })

      // updateSpaceById(space.id, data)

      store.set(
        spaceAtom,
        new Space({
          ...space.raw,
          ...data,
          uri: res.cid,
        }),
      )

      toast.success('Space updated successfully!')
      revalidateMetadata('spaces')
      setIsOpen(false)
    } catch (error) {
      const msg = extractErrorMessage(error)
      toast.error(msg || 'Failed to update space. Please try again later.')
    }

    setLoading(false)
  }

  return (
    <div className="flex flex-col gap-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex gap-8">
            <div className="w-72 flex-shrink-0">
              <FormField
                control={form.control}
                name="logo"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Logo</FormLabel>
                    <FormControl>
                      <FileUpload
                        value={field.value}
                        onChange={async (url) => {
                          field.onChange(url)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Space name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Space Name"
                        {...field}
                        className="w-full"
                      />
                    </FormControl>
                    <FormDescription>
                      The name of your space. This will be used as the meta
                      title on Google as well.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="" {...field} />
                    </FormControl>
                    <FormDescription>
                      The description of your space. This will be used as the
                      meta description on Google as well.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex-1">
              <FormField
                control={form.control}
                name="about"
                render={({ field }) => (
                  <FormItem className="w-full h-full">
                    <FormLabel>About</FormLabel>
                    <FormControl>
                      <div className="h-[400px] border border-foreground/20 rounded-lg overflow-auto">
                        <PlateEditor
                          value={JSON.parse(field.value)}
                          onChange={(v) => {
                            field.onChange(JSON.stringify(v))
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <Button type="submit" className="w-32">
            {loading ? <LoadingDots className="" /> : <p>Update Space</p>}
          </Button>
        </form>
      </Form>
    </div>
  )
}
