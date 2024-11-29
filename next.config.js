const { env } = require('./server/env')
const { createVanillaExtractPlugin } = require('@vanilla-extract/next-plugin')
const withVanillaExtract = createVanillaExtractPlugin()

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['app.localhost:4000'],
    },
  },

  /**
   * Dynamic configuration available for the browser and server.
   * Note: requires `ssr: true` or a `getInitialProps` in `_app.tsx`
   * @link https://nextjs.org/docs/api-reference/next.config.js/runtime-configuration
   */
  publicRuntimeConfig: {
    NODE_ENV: env.NODE_ENV,
  },
  output: 'standalone',
  transpilePackages: [
    'react-tweet',
    'penx-theme-micro',
    'penx-theme-card',
    'penx-theme-minimal',
    'penx-theme-garden',
    'penx-theme-photo',
  ],

  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    remotePatterns: [
      { hostname: 'public.blob.vercel-storage.com' },
      { hostname: '2cil7amusloluyl8.public.blob.vercel-storage.com' },
      { hostname: '*.public.blob.vercel-storage.com' },
      { hostname: '*.spaceprotocol.xyz' },
      { hostname: '*.respace.one' },
      { hostname: '*.penx.io' },
      { hostname: 'penx.io' },
      { hostname: 'res.cloudinary.com' },
      { hostname: 'abs.twimg.com' },
      { hostname: 'pbs.twimg.com' },
      { hostname: 'avatar.vercel.sh' },
      { hostname: 'avatars.githubusercontent.com' },
      { hostname: 'lh3.googleusercontent.com' },
      { hostname: 'www.google.com' },
      { hostname: 'flag.vercel.app' },
      { hostname: 'imagedelivery.net' },
    ],
  },

  webpack: (config, { isServer }) => {
    // https://stackoverflow.com/questions/64926174/module-not-found-cant-resolve-fs-in-next-js-application
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
    }

    config.externals.push('pino-pretty', 'lokijs', 'encoding', 'bcrypt')

    return config
  },
}

module.exports = withVanillaExtract(nextConfig)
