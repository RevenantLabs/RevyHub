import { Keypair } from "@stellar/stellar-sdk";
import { MAX_WASM_BYTES } from "@/features/contract-upgrade-diff-report/schema";
import {
  concat,
  customSection,
  envMeta,
  errorEnum,
  fn,
  meta,
  struct,
  types,
  uleb,
  wasmModule
} from "@/features/contract-upgrade-diff-report/fixtures/normal.fixture";

/**
 * Adverse and incomplete-evidence inputs from the acceptance criteria. Each
 * one differs from a clean module in exactly the way its name says.
 */

const transfer = fn("transfer", [
  ["to", types.address()],
  ["amount", types.i128()]
]);
const spec = concat(transfer, errorEnum("Error", [["NotFound", 1]]));

/* --------------------------------- sections --------------------------------- */

/** The same spec section emitted twice, byte for byte: merged, no collision. */
export const duplicateIdenticalSpecWasm = wasmModule(
  customSection("contractenvmetav0", envMeta(22)),
  customSection("contractspecv0", spec),
  customSection("contractspecv0", spec)
);

/** Two environment sections that agree. */
export const duplicateAgreeingEnvWasm = wasmModule(
  customSection("contractenvmetav0", envMeta(22)),
  customSection("contractenvmetav0", envMeta(22)),
  customSection("contractspecv0", spec)
);

/** Two environment sections that disagree: neither can be trusted. */
export const duplicateConflictingEnvWasm = wasmModule(
  customSection("contractenvmetav0", envMeta(21)),
  customSection("contractenvmetav0", envMeta(22)),
  customSection("contractspecv0", spec)
);

/** Same spec, environment 22 with a pre-release number. */
export const preReleaseEnvWasm = wasmModule(
  customSection("contractenvmetav0", envMeta(22, 3)),
  customSection("contractspecv0", spec)
);

/** Baseline the edge cases above are compared against. */
export const baselineWasm = wasmModule(
  customSection("contractenvmetav0", envMeta(21)),
  customSection("contractmetav0", concat(meta("rsver", "1.79.0"))),
  customSection("contractspecv0", spec)
);

/** Spec XDR cut off in the middle of an entry. */
export const truncatedSpecWasm = wasmModule(
  customSection("contractenvmetav0", envMeta(22)),
  customSection("contractspecv0", spec.slice(0, spec.length - 6))
);

/** Spec XDR with a non-zero padding byte inside a string. */
export const badPaddingSpecWasm = (() => {
  const bytes = [...transfer];
  // fn discriminant (4) + doc len (4) + name len (4) + "transfer" (8, no padding)
  // + inputs len (4) + doc len (4) + name len (4) + "to" + 2 padding bytes.
  bytes[4 + 4 + 4 + 8 + 4 + 4 + 4 + 2] = 0xff;
  return wasmModule(customSection("contractspecv0", bytes));
})();

/** A spec entry kind the installed SDK does not define (5, a later protocol's event spec). */
export const unsupportedSpecKindWasm = (() => {
  const bytes = [...transfer];
  bytes[3] = 5;
  return wasmModule(customSection("contractenvmetav0", envMeta(22)), customSection("contractspecv0", bytes));
})();

/** No spec section at all: missing evidence, not an empty interface. */
export const noSpecWasm = wasmModule(customSection("contractenvmetav0", envMeta(22)));

/** A present but empty spec section: a valid, empty interface. */
export const emptySpecWasm = wasmModule(
  customSection("contractenvmetav0", envMeta(22)),
  customSection("contractspecv0", [])
);

/** An environment section that holds no entry. */
export const emptyEnvWasm = wasmModule(customSection("contractenvmetav0", []), customSection("contractspecv0", spec));

/** Metadata XDR that is not valid UTF-8 text. */
export const invalidUtf8MetaWasm = (() => {
  const bytes = [...meta("rsver", "abcd")];
  bytes[bytes.length - 4] = 0xff;
  return wasmModule(customSection("contractspecv0", spec), customSection("contractmetav0", bytes));
})();

/* ------------------------------- collisions -------------------------------- */

/** Two functions named `transfer` with different signatures. */
export const functionCollisionWasm = wasmModule(
  customSection("contractenvmetav0", envMeta(22)),
  customSection(
    "contractspecv0",
    concat(spec, fn("transfer", [["to", types.address()]], [types.bool()]))
  )
);

/** A struct and an error enum sharing the user-defined type name `Error`. */
export const udtCollisionWasm = wasmModule(
  customSection("contractenvmetav0", envMeta(22)),
  customSection("contractspecv0", concat(spec, struct("Error", [["code", types.u32()]])))
);

/** One error enum declaring the case `NotFound` twice. */
export const memberCollisionWasm = wasmModule(
  customSection("contractenvmetav0", envMeta(22)),
  customSection(
    "contractspecv0",
    concat(
      transfer,
      errorEnum("Error", [
        ["NotFound", 1],
        ["NotFound", 2]
      ])
    )
  )
);

/** Metadata declaring `rsver` twice with different values. */
export const metaCollisionWasm = wasmModule(
  customSection("contractenvmetav0", envMeta(21)),
  customSection("contractmetav0", concat(meta("rsver", "1.79.0"), meta("rsver", "1.80.0"))),
  customSection("contractspecv0", spec)
);

/* --------------------------------- framing --------------------------------- */

const HEADER = [0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00];

export const notWasmBytes = Uint8Array.from(new TextEncoder().encode("PK\u0003\u0004 not a wasm module"));
export const headerOnlyWasm = Uint8Array.from(HEADER);
export const shortHeaderWasm = Uint8Array.from(HEADER.slice(0, 6));
/** The component-model layer header: right magic, different version. */
export const componentModelWasm = Uint8Array.from([0x00, 0x61, 0x73, 0x6d, 0x0d, 0x00, 0x01, 0x00]);
/** A section id past 13. */
export const unknownSectionIdWasm = Uint8Array.from([...HEADER, 0x2a, 0x00]);
/** A section length whose fifth LEB128 byte sets bits beyond 32. */
export const overflowingLebWasm = Uint8Array.from([...HEADER, 0x00, 0xff, 0xff, 0xff, 0xff, 0x7f]);
/** A section length LEB128 that never terminates. */
export const unterminatedLebWasm = Uint8Array.from([...HEADER, 0x00, 0x80, 0x80]);
/** A section that declares 2^32 - 1 bytes in a tiny file. */
export const sectionPastEndWasm = Uint8Array.from([...HEADER, 0x00, 0xff, 0xff, 0xff, 0xff, 0x0f, 0x00]);
/** A custom section whose name length runs past the section end. */
export const namePastSectionWasm = Uint8Array.from([...HEADER, 0x00, 0x02, 0x10, 0x61]);
/** A custom section name that is not valid UTF-8. */
export const invalidUtf8NameWasm = Uint8Array.from([...HEADER, 0x00, 0x02, 0x01, 0xff]);
/** Two type sections. */
export const duplicateStandardSectionWasm = Uint8Array.from([...HEADER, 0x01, 0x01, 0x00, 0x01, 0x01, 0x00]);

/* ---------------------------------- bounds --------------------------------- */

/** Pads a module with a trailing custom section so it is exactly `total` bytes long. */
export function padToExactly(module: Uint8Array, total: number): Uint8Array {
  const remaining = total - module.length;
  const name = [...new TextEncoder().encode("pad")];
  for (let lebLength = 1; lebLength <= 5; lebLength++) {
    const sectionSize = remaining - 1 - lebLength;
    const payload = sectionSize - 1 - name.length;
    if (payload >= 0 && uleb(sectionSize).length === lebLength) {
      const out = new Uint8Array(total);
      out.set(module, 0);
      out.set([0x00, ...uleb(sectionSize), name.length, ...name], module.length);
      return out;
    }
  }
  throw new Error(`cannot pad ${module.length} bytes to ${total}`);
}

/** A valid module of exactly 1 MiB: accepted. */
export const exactlyMaxWasm = padToExactly(baselineWasm, MAX_WASM_BYTES);
/** One byte over: refused before decoding. */
export const overMaxWasm = padToExactly(baselineWasm, MAX_WASM_BYTES + 1);

/* --------------------------------- secrets --------------------------------- */

/** A secret seed derived from a fixed raw seed, saved as if it were a file. */
export const secretSeed = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 9)).secret();
export const secretSeedBytes = new TextEncoder().encode(`${secretSeed}\n`);
