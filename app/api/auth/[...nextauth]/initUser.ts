import { editorDefaultValue } from '@/lib/constants'
import { prisma } from '@/lib/prisma'
import { SubdomainType } from '@prisma/client'

export async function initUserByAddress(address: string) {
  return prisma.$transaction(
    async (tx) => {
      let user = await tx.user.findUnique({
        where: { address },
        include: {
          sites: {
            include: {
              domains: true,
            },
          },
        },
      })

      if (user) return user

      let newUser = await tx.user.create({
        data: { address },
      })

      const site = await tx.site.create({
        data: {
          name: address.slice(0, 6),
          description: 'My personal site',
          userId: newUser.id,
          socials: {},
          config: {},
          about: JSON.stringify(editorDefaultValue),
          logo: 'https://penx.io/logo.png',
          themeName: 'garden',
          domains: {
            create: [
              {
                domain: address.toLowerCase(),
                subdomainType: SubdomainType.Address,
              },
            ],
          },
          contributors: {
            create: {
              userId: newUser.id,
            },
          },
          channels: {
            create: {
              name: 'general',
              type: 'TEXT',
            },
          },
        },
      })

      return tx.user.findUnique({
        where: { id: newUser.id },
        include: {
          sites: {
            include: {
              domains: true,
            },
          },
        },
      })
    },
    {
      maxWait: 5000, // default: 2000
      timeout: 10000, // default: 5000
    },
  )
}

type GoogleLoginInfo = {
  email: string
  openid: string
  picture: string
  name: string
}

export async function initUserByGoogleInfo(info: GoogleLoginInfo) {
  return prisma.$transaction(
    async (tx) => {
      let user = await tx.user.findUnique({
        where: { googleId: info.openid },
        include: {
          sites: {
            include: {
              domains: true,
            },
          },
        },
      })
      if (user) return user

      let newUser = await tx.user.create({
        data: {
          name: info.name,
          email: info.email,
          googleId: info.openid,
          image: info.picture,
          google: {
            name: info.name,
            image: info.picture,
          },
        },
      })

      const site = await tx.site.create({
        data: {
          name: info.name,
          description: 'My personal site',
          userId: newUser.id,
          socials: {},
          config: {},
          about: JSON.stringify(editorDefaultValue),
          logo: info.picture,
          themeName: 'garden',
          domains: {
            create: [
              {
                domain: newUser.id.toLowerCase(),
                subdomainType: SubdomainType.UserId,
              },
            ],
          },
          contributors: {
            create: {
              userId: newUser.id,
            },
          },
          channels: {
            create: {
              name: 'general',
              type: 'TEXT',
            },
          },
        },
      })

      return tx.user.findUnique({
        where: { id: newUser.id },
        include: {
          sites: {
            include: {
              domains: true,
            },
          },
        },
      })
    },
    {
      maxWait: 5000, // default: 2000
      timeout: 10000, // default: 5000
    },
  )
}

type FarcasterLoginInfo = {
  fid: string
  image: string
  name: string
}

export async function initUserByFarcasterInfo(info: FarcasterLoginInfo) {
  return prisma.$transaction(
    async (tx) => {
      let user = await tx.user.findUnique({
        where: { fid: info.fid },
        include: {
          sites: {
            include: {
              domains: true,
            },
          },
        },
      })
      if (user) return user

      let newUser = await tx.user.create({
        data: {
          name: info.name,
          fid: info.fid,
          image: info.image,
          farcaster: {
            name: info.name,
            image: info.image,
          },
        },
      })

      const site = await tx.site.create({
        data: {
          name: info.name,
          description: 'My personal site',
          userId: newUser.id,
          socials: {},
          config: {},
          about: JSON.stringify(editorDefaultValue),
          logo: info.image,
          themeName: 'garden',
          domains: {
            create: [
              {
                domain: newUser.id!.toLowerCase(),
                subdomainType: SubdomainType.UserId,
              },
            ],
          },
          contributors: {
            create: {
              userId: newUser.id,
            },
          },
          channels: {
            create: {
              name: 'general',
              type: 'TEXT',
            },
          },
        },
      })

      return tx.user.findUnique({
        where: { id: newUser.id },
        include: {
          sites: {
            include: {
              domains: true,
            },
          },
        },
      })
    },
    {
      maxWait: 5000, // default: 2000
      timeout: 10000, // default: 5000
    },
  )
}
