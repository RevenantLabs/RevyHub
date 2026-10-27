import { describe, expect, it } from "vitest"; import { formatByteSize, formatEnvVersion } from "@/features/contract-metadata-viewer/lib/format";
describe("metadata formatting", () => { it("formats interface versions", () => expect(formatEnvVersion({ protocol: 23, preRelease: 1 })).toBe("23.1")); it("formats byte size", () => expect(formatByteSize(1234)).toBe("1,234 bytes")); });
