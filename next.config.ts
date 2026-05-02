import type { NextConfig } from 'next'
// @ts-expect-error — next-pwa v5 has no TS types
import withPWA from 'next-pwa'

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  buildExcludes: [/middleware-manifest\.json$/],
})

const nextConfig: NextConfig = {}

export default pwaConfig(nextConfig)
