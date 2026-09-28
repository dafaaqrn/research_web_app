import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    '192.168.100.124',
    'mayflower-graceful-wipe.ngrok-free.dev',
  ],
}

export default nextConfig