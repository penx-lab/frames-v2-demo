import { spaceAbi } from '@/lib/abi'
import { NETWORK, NetworkNames, PROJECT_ID, ROOT_DOMAIN } from '@/lib/constants'
import { getBasePublicClient } from '@/lib/getBasePublicClient'
import { getSiteDomain, UserWithDomains } from '@/lib/getSiteDomain'
import { prisma } from '@/lib/prisma'
import { SubscriptionInSession } from '@/lib/types'
import { createAppClient, viemConnector } from '@farcaster/auth-client'
import { PrivyClient } from '@privy-io/server-auth'
import NextAuth, { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { Address } from 'viem'
import {
  parseSiweMessage,
  validateSiweMessage,
  type SiweMessage,
} from 'viem/siwe'
import {
  initUserByAddress,
  initUserByFarcasterInfo,
  initUserByGoogleInfo,
} from './initUser'

declare module 'next-auth' {
  interface Session {
    address: string
    name: string
    userId: string
    ensName: string | null
    role: string
    domain: {
      domain: string
      isSubdomain: boolean
    }
    subscriptions: SubscriptionInSession[]
  }
}

export { handler as GET, handler as POST }

async function handler(req: Request, res: Response) {
  const nextAuthSecret = await getAuthSecret()
  if (!nextAuthSecret) {
    throw new Error('NEXTAUTH_SECRET is not set')
  }

  const host = req.headers.get('host')

  process.env.NEXTAUTH_URL =
    process.env.NEXTAUTH_URL ||
    (/localhost/.test(host || '') ? `http://${host}` : `https://${host}`)

  return await NextAuth(req as any, res as any, {
    secret: nextAuthSecret,
    providers: [
      CredentialsProvider({
        name: 'Ethereum',
        credentials: {
          message: {
            label: 'Message',
            placeholder: '0x0',
            type: 'text',
          },
          signature: {
            label: 'Signature',
            placeholder: '0x0',
            type: 'text',
          },
        },
        async authorize(credentials: any) {
          try {
            const siweMessage = parseSiweMessage(
              credentials?.message,
            ) as SiweMessage

            if (
              !validateSiweMessage({
                address: siweMessage?.address,
                message: siweMessage,
              })
            ) {
              return null
            }

            const publicClient = getBasePublicClient(NETWORK)

            const valid = await publicClient.verifyMessage({
              address: siweMessage?.address,
              message: credentials?.message,
              signature: credentials?.signature,
            })

            if (!valid) {
              return null
            }
            const address = siweMessage.address

            const user = await initUserByAddress(address)
            updateSubscriptions(address as Address)
            return { ...user } as any
          } catch (e) {
            // console.log('e======:', e)
            return null
          }
        },
      }),
      CredentialsProvider({
        id: 'privy',
        name: 'Privy',
        credentials: {
          token: {
            label: 'Token',
            type: 'text',
            placeholder: '',
          },
          address: {
            label: 'Address',
            type: 'text',
            placeholder: '',
          },
        },
        async authorize(credentials) {
          try {
            if (!credentials?.token || !credentials?.address) {
              throw new Error('Token is undefined')
            }

            const { token, address } = credentials
            // console.log('====== token, address:', token, address)
            const site = await prisma.site.findFirst()
            if (!site) return null

            const authConfig = site.authConfig as any
            const privy = new PrivyClient(
              authConfig.privyAppId,
              authConfig.privyAppSecret,
            )

            try {
              const t0 = Date.now()
              await privy.verifyAuthToken(token)
              const t1 = Date.now()
              console.log('t1-t0=======>', t1 - t0)
              const user = await initUserByAddress(address)
              const t2 = Date.now()
              console.log('t2-t1=======>', t2 - t1)
              // console.log('=====user:', user)
              updateSubscriptions(address as Address)
              return user
            } catch (error) {
              console.log('====authorize=error:', error)
              return null
            }
          } catch (e) {
            return null
          }
        },
      }),

      CredentialsProvider({
        id: 'penx-google',
        name: 'PenX',
        credentials: {
          email: {
            label: 'Email',
            type: 'text',
            placeholder: '',
          },
          openid: {
            label: 'OpenID',
            type: 'text',
            placeholder: '',
          },
          picture: {
            label: 'Picture',
            type: 'text',
            placeholder: '',
          },
          name: {
            label: 'Picture',
            type: 'text',
            placeholder: '',
          },
        },
        async authorize(credentials) {
          try {
            if (!credentials?.email || !credentials?.openid) {
              throw new Error('Login fail')
            }

            const user = await initUserByGoogleInfo(credentials)
            return user
          } catch (e) {
            console.log('=======>>>>e:', e)
            return null
          }
        },
      }),
      CredentialsProvider({
        id: 'penx-farcaster',
        name: 'Sign in with Farcaster',
        credentials: {
          message: {
            label: 'Message',
            type: 'text',
            placeholder: '0x0',
          },
          signature: {
            label: 'Signature',
            type: 'text',
            placeholder: '0x0',
          },
          // In a production app with a server, these should be fetched from
          // your Farcaster data indexer rather than have them accepted as part
          // of credentials.
          name: {
            label: 'Name',
            type: 'text',
            placeholder: '0x0',
          },
          pfp: {
            label: 'Pfp',
            type: 'text',
            placeholder: '0x0',
          },
        },
        async authorize(credentials: any) {
          console.log('======credentials:', credentials)

          try {
            const appClient = createAppClient({
              ethereum: viemConnector(),
            })

            const verifyResponse = await appClient.verifySignInMessage({
              message: credentials?.message as string,
              signature: credentials?.signature as `0x${string}`,
              domain: ROOT_DOMAIN,
              nonce: credentials.csrfToken,
            })
            const { success, fid } = verifyResponse

            if (!success) {
              return null
            }

            console.log('======:fid', fid.toString(), 'username:', credentials)

            const user = await initUserByFarcasterInfo({
              fid: fid.toString(),
              name: credentials?.name,
              image: credentials?.pfp,
            })
            return user
          } catch (error) {
            console.log('=====farcaster sign error==>>>>:', error)
            return null
          }
        },
      }),
    ],
    pages: {
      signIn: `/login`,
      verifyRequest: `/login`,
      error: '/error', // Error code passed in query string as ?error=
      newUser: '/',
    },
    session: { strategy: 'jwt' },
    callbacks: {
      async jwt({ token, account, user, profile, trigger, session }) {
        if (user) {
          const sessionUser = user as UserWithDomains
          // console.log('=====sessionUser:', sessionUser)

          token.uid = sessionUser.id
          token.address = sessionUser.address as string
          token.ensName = sessionUser.ensName as string
          token.name = sessionUser.name as string
          token.role = sessionUser.role as string
          token.domain = getSiteDomain(sessionUser.sites[0])

          token.subscriptions = Array.isArray(sessionUser.subscriptions)
            ? sessionUser.subscriptions.map((i: any) => ({
                planId: i.planId,
                startTime: i.startTime,
                duration: i.duration,
              }))
            : []
        }
        if (trigger === 'update') {
          const subscriptions = await updateSubscriptions(
            session.address as any,
          )

          token.subscriptions = Array.isArray(subscriptions)
            ? subscriptions.map((i: any) => ({
                planId: i.planId,
                startTime: Number(i.startTime),
                duration: Number(i.duration),
              }))
            : []
        }

        // console.log('jwt token========:', token)

        return token
      },
      session({ session, token, user, trigger, newSession }) {
        session.userId = token.uid as string
        session.address = token.address as string
        session.name = token.name as string
        session.ensName = token.ensName as string
        session.role = token.role as string
        session.domain = token.domain as any
        session.subscriptions = token.subscriptions as any

        return session
      },
    },
  })
}

async function updateSubscriptions(address: Address) {
  const site = await prisma.site.findFirst()
  if (!site?.spaceId) return []
  try {
    const publicClient = getBasePublicClient(NETWORK)

    const subscription = await publicClient.readContract({
      abi: spaceAbi,
      address: site?.spaceId as Address,
      functionName: 'getSubscription',
      args: [0, address],
    })

    await prisma.user.update({
      where: { address },
      data: {
        subscriptions: [
          {
            ...subscription,
            startTime: Number(subscription.startTime),
            duration: Number(subscription.duration),
            amount: subscription.amount.toString(),
          },
        ],
      },
    })
    return [subscription]
  } catch (error) {
    console.log('====== updateSubscriptions=error:', error)
    return []
  }
}

let secret = ''

async function getAuthSecret() {
  let nextAuthSecret = process.env.NEXTAUTH_SECRET
  if (nextAuthSecret) return nextAuthSecret
  if (secret) return secret

  const site = await prisma.site.findFirst({
    select: {
      authSecret: true,
    },
  })
  secret = site?.authSecret || ''
  return site?.authSecret || ''
}
