import prisma from '@/lib/prisma'
import { Site } from '@penxio/types'
import { gql, request } from 'graphql-request'
import ky from 'ky'
import { unstable_cache } from 'next/cache'
import {
  editorDefaultValue,
  isProd,
  PostStatus,
  RESPACE_BASE_URI,
  ROOT_DOMAIN,
  SUBGRAPH_URL,
} from './constants'
import { SpaceType } from './types'
import { getUrl } from './utils'

export async function getSite(params: any) {
  let domain = decodeURIComponent(params.domain)
  console.log('params=======:', params, 'domain:', domain)

  const isSubdomain = domain.endsWith(`.${ROOT_DOMAIN}`)
  console.log('=====isSubdomain:', isSubdomain)

  if (isSubdomain) {
    domain = domain.replace(`.${ROOT_DOMAIN}`, '')
  }

  console.log('=========>>>>domain:', domain)

  return await unstable_cache(
    async () => {
      const { siteId } = await prisma.domain.findUniqueOrThrow({
        where: { domain: domain, isSubdomain },
        select: { siteId: true, isSubdomain: true },
      })
      console.log('=====siteId:', siteId)

      const site = await prisma.site.findUniqueOrThrow({
        where: { id: siteId },
        include: { user: true },
      })
      console.log('=====site:', site)

      function getAbout() {
        if (!site?.about) return editorDefaultValue
        try {
          return JSON.parse(site.about)
        } catch (error) {
          return editorDefaultValue
        }
      }

      return {
        ...site,
        // spaceId: site.spaceId || process.env.NEXT_PUBLIC_SPACE_ID,
        spaceId: process.env.NEXT_PUBLIC_SPACE_ID || site.spaceId,
        logo: getUrl(site.logo || ''),
        image: getUrl(site.image || ''),
        about: getAbout(),
      } as any as Site
    },
    [`site-${domain}`],
    {
      // revalidate: isProd ? 3600 * 24 : 10,
      revalidate: 10,
      tags: [`site-${domain}`],
    },
  )()
}

export async function getPosts() {
  return await unstable_cache(
    async () => {
      const posts = await prisma.post.findMany({
        include: {
          postTags: { include: { tag: true } },
          user: {
            select: {
              address: true,
              email: true,
              name: true,
              image: true,
            },
          },
        },
        where: {
          postStatus: PostStatus.PUBLISHED,
        },
        orderBy: [{ createdAt: 'desc' }],
      })
      return posts.map((post) => ({
        ...post,
        image: getUrl(post.image || ''),
      }))
    },
    [`posts`],
    {
      revalidate: isProd ? 3600 * 24 : 10,
      tags: [`posts`],
    },
  )()
}

export async function getPost(slug: string) {
  return await unstable_cache(
    async () => {
      const post = await prisma.post.findFirst({
        where: { slug },
      })

      if (!post) return null

      return {
        ...post,
        image: getUrl(post.image || ''),
      }
    },
    [`post-${slug}`],
    {
      revalidate: 3600 * 24, // 15 minutes
      tags: [`posts-${slug}`],
    },
  )()
}

export async function getTags() {
  return await unstable_cache(
    async () => {
      return prisma.tag.findMany()
    },
    [`tags`],
    {
      revalidate: 3600,
      tags: [`tags`],
    },
  )()
}

export async function getTagWithPost(name: string) {
  return await unstable_cache(
    async () => {
      return prisma.tag.findFirst({
        include: { postTags: { include: { post: true } } },
        where: { name },
      })
    },
    [`tags-${name}`],
    {
      revalidate: 3600,
      tags: [`tags-${name}`],
    },
  )()
}

// export async function getTagPosts() {
//   return await unstable_cache(
//     async () => {
//       return prisma.tag.findMany()
//     },
//     [`tags-posts`],
//     {
//       revalidate: 3600,
//       tags: [`tags-post`],
//     },
//   )()
// }

export async function getSpace(spaceId: string) {
  return await unstable_cache(
    async () => {
      const response = await ky
        .get(RESPACE_BASE_URI + `/api/get-space?address=${spaceId}`)
        .json<SpaceType>()
      console.log('---=====>response:', response)

      return response
    },
    [`space-${spaceId}`],
    {
      revalidate: isProd ? 3600 : 10,
      tags: [`space-${spaceId}`],
    },
  )()
}

const spaceIdsQuery = gql`
  {
    spaces(first: 1000) {
      id
    }
  }
`

export async function getSpaceIds() {
  return await unstable_cache(
    async () => {
      try {
        const { spaces = [] } = await request<{ spaces: SpaceType[] }>({
          url: SUBGRAPH_URL,
          document: spaceIdsQuery,
        })
        return spaces
      } catch (error) {
        return []
      }
    },
    ['space-ids'],
    {
      revalidate: 60 * 60 * 24 * 365,
      tags: ['space-ids'],
    },
  )()
}
