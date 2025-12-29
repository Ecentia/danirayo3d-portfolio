import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'], // Obligatorio para 3D
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'nrjnpplhuzrrxwhriiuv.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;