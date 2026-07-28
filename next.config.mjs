import { buildSecurityHeaders } from "./lib/security-headers.mjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: buildSecurityHeaders(process.env.NODE_ENV !== "production")
      }
    ];
  }
};

export default nextConfig;
