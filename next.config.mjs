/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    const isProduction = process.env.NODE_ENV === "production";

    const horizonTestnet =
      process.env.NEXT_PUBLIC_HORIZON_TESTNET_URL ??
      "https://horizon-testnet.stellar.org";

    const horizonMainnet =
      process.env.NEXT_PUBLIC_HORIZON_MAINNET_URL ??
      "https://horizon.stellar.org";

    const sorobanRpc = process.env.NEXT_PUBLIC_SOROBAN_RPC_URL;

    const imageOrigins =
      process.env.NEXT_PUBLIC_IMAGE_ORIGINS;

    const connectSrc = [
      "'self'",
      horizonTestnet,
      horizonMainnet,
      "https://friendbot.stellar.org",
    ];

    if (sorobanRpc) {
      connectSrc.push(sorobanRpc);
    }

    const imgSrc = ["'self'", "data:"];

    if (imageOrigins) {
      for (const origin of imageOrigins.split(",")) {
        const trimmed = origin.trim();
        if (trimmed) {
          imgSrc.push(trimmed);
        }
      }
    }

    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      `img-src ${imgSrc.join(" ")}`,
      "font-src 'self'",
      `connect-src ${connectSrc.join(" ")}`,
      "frame-src 'none'",
      "form-action 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
    ].join("; ");

    const securityHeaders = [
      { key: "Content-Security-Policy", value: csp },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
      { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
      { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
    ];

    if (isProduction) {
      securityHeaders.push({
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      });
    }

    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
