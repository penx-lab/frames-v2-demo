import { addDomainToVercel } from '@/lib/domains'
import { prisma } from '@/lib/prisma'
import { AuthType, StorageProvider, SubdomainType } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { protectedProcedure, publicProcedure, router } from '../trpc'

export const siteRouter = router({
  list: publicProcedure.query(async () => {
    return prisma.site.findMany({
      include: {
        domains: true,
      },
    })
  }),

  mySites: publicProcedure.query(async () => {
    return prisma.site.findMany({
      include: {
        channels: true,
      },
    })
  }),

  getSite: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return prisma.site.findUniqueOrThrow({
        where: { id: input.id },
      })
    }),

  bySubdomain: protectedProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const { siteId } = await prisma.domain.findUniqueOrThrow({
        where: { domain: input },
        select: { siteId: true },
      })
      const site = await prisma.site.findUnique({
        where: { id: siteId },
        include: { domains: true },
      })

      if (site) return site

      const user = await prisma.user.findUniqueOrThrow({
        where: { id: ctx.token.uid },
        include: {
          sites: { select: { id: true } },
        },
      })

      return prisma.site.findUniqueOrThrow({
        where: { id: user.sites[0]?.id },
        include: { domains: true },
      })
    }),

  updateSite: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        logo: z.string().optional(),
        name: z.string().optional(),
        description: z.string().optional(),
        about: z.string().optional(),
        themeName: z.string().optional(),
        spaceId: z.string().optional(),
        socials: z
          .object({
            farcaster: z.string().optional(),
            x: z.string().optional(),
            mastodon: z.string().optional(),
            github: z.string().optional(),
            facebook: z.string().optional(),
            youtube: z.string().optional(),
            linkedin: z.string().optional(),
            threads: z.string().optional(),
            instagram: z.string().optional(),
            medium: z.string().optional(),
          })
          .optional(),
        authType: z.nativeEnum(AuthType).optional(),
        authConfig: z
          .object({
            privyAppId: z.string().optional(),
            privyAppSecret: z.string().optional(),
          })
          .optional(),
        storageProvider: z.nativeEnum(StorageProvider).optional(),
        storageConfig: z
          .object({
            vercelBlobToken: z.string().optional(),
          })
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input
      const newSite = await prisma.site.update({
        where: { id },
        data,
      })

      revalidatePath('/', 'layout')
      revalidatePath('/', 'page')
      revalidatePath('/about/page', 'page')
      revalidatePath('/~', 'layout')
      return newSite
    }),

  customSubdomain: protectedProcedure
    .input(
      z.object({
        siteId: z.string(),
        domain: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { siteId } = input

      const domain = await prisma.domain.findUnique({
        where: {
          subdomainType: SubdomainType.Custom,
          domain: input.domain,
          isSubdomain: true,
        },
      })

      if (!domain) {
        await prisma.domain.create({
          data: {
            domain: input.domain,
            isSubdomain: true,
            siteId,
          },
        })
      } else {
        if (siteId !== domain.siteId) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Domain already exists.',
          })
        }

        await prisma.domain.update({
          where: { id: domain.id },
          data: { domain: input.domain },
        })
      }

      return true
    }),

  customDomain: protectedProcedure
    .input(
      z.object({
        siteId: z.string(),
        domain: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { siteId } = input

      const domain = await prisma.domain.findUnique({
        where: {
          domain: input.domain,
          isSubdomain: false,
        },
      })

      if (!domain) {
        await prisma.domain.create({
          data: {
            domain: input.domain,
            isSubdomain: false,
            siteId,
          },
        })
      } else {
        if (siteId !== domain.siteId) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Domain already exists.',
          })
        }

        await prisma.domain.update({
          where: { id: domain.id },
          data: { domain: input.domain },
        })
      }

      const res = await addDomainToVercel(input.domain)
      return res
    }),
})
