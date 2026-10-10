import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Next's own default is 1mb, far below what a scanned contract or a
      // phone photo needs. 4mb stays just under Vercel Serverless Functions'
      // own ~4.5mb request body ceiling, which this setting cannot raise.
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
