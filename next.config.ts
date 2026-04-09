import type { NextConfig } from "next";

const isGHPages = process.env.GITHUB_PAGES === 'true';

const nextConfig: NextConfig = {
  output: isGHPages ? 'export' : undefined,
  basePath: isGHPages ? '/STEVE_IVR' : '',
  images: { unoptimized: true },
};

export default nextConfig;
