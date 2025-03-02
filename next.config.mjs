import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const nextConfig = {
    pageExtensions: ['mdx', 'md', 'jsx', 'js', 'tsx', 'ts'],
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'cdn.shopify.com',
          },
        ],
      },
};

export default withMDX(nextConfig);
