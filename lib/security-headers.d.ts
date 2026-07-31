export function getStellarConnectSources(): string[];
export function buildContentSecurityPolicy(isDevelopment?: boolean): string;
export function buildSecurityHeaders(isDevelopment?: boolean): Array<{ key: string; value: string }>;
