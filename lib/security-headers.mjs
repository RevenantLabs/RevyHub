const DEFAULT_HORIZON_TESTNET_URL = "https://horizon-testnet.stellar.org";
const DEFAULT_HORIZON_MAINNET_URL = "https://horizon.stellar.org";
const DEFAULT_FRIENDBOT_URL = "https://friendbot.stellar.org";
const LOCAL_DEVELOPMENT_SOURCES = ["http://localhost:*", "http://127.0.0.1:*"];

function originFromUrl(url) {
  if (!url) {
    return null;
  }

  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

function uniqueSources(sources) {
  return Array.from(new Set(sources.filter(Boolean)));
}

export function getStellarConnectSources() {
  return uniqueSources([
    originFromUrl(process.env.NEXT_PUBLIC_HORIZON_TESTNET_URL ?? DEFAULT_HORIZON_TESTNET_URL),
    originFromUrl(process.env.NEXT_PUBLIC_HORIZON_MAINNET_URL ?? DEFAULT_HORIZON_MAINNET_URL),
    originFromUrl(process.env.NEXT_PUBLIC_FRIENDBOT_URL ?? DEFAULT_FRIENDBOT_URL)
  ]);
}

export function buildContentSecurityPolicy(isDevelopment = process.env.NODE_ENV !== "production") {
  const scriptSources = ["'self'", ...(isDevelopment ? ["'unsafe-eval'"] : [])];
  const styleSources = ["'self'", "'unsafe-inline'"];
  const imageSources = ["'self'", "data:", "blob:"];
  const connectSources = ["'self'", ...getStellarConnectSources(), ...(isDevelopment ? LOCAL_DEVELOPMENT_SOURCES : [])];

  const directives = {
    "default-src": ["'self'"],
    "script-src": scriptSources,
    "style-src": styleSources,
    "img-src": imageSources,
    "connect-src": connectSources,
    "font-src": ["'self'"],
    "frame-src": ["'none'"],
    "object-src": ["'none'"],
    "form-action": ["'self'"],
    "base-uri": ["'self'"],
    "frame-ancestors": ["'none'"],
    "upgrade-insecure-requests": []
  };

  if (isDevelopment) {
    delete directives["upgrade-insecure-requests"];
  }

  return Object.entries(directives)
    .map(([directive, sources]) => (sources.length > 0 ? `${directive} ${sources.join(" ")}` : directive))
    .join("; ");
}

export function buildSecurityHeaders(isDevelopment = process.env.NODE_ENV !== "production") {
  return [
    { key: "Content-Security-Policy", value: buildContentSecurityPolicy(isDevelopment) },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()"
    },
    { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" }
  ];
}
