import type { EnvVersion } from "@/features/contract-metadata-viewer/types";
export function formatEnvVersion(version: EnvVersion): string { return `${version.protocol}.${version.preRelease}`; }
export function formatByteSize(bytes: number): string { return `${bytes.toLocaleString("en-US")} bytes`; }
