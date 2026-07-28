import { BookOpen, Hash, Network, Radio, Wallet, Star, ShieldCheck, ArrowLeftRight } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { CharacterPanel } from "@/components/ui/CharacterPanel";

const sections = [
  {
    icon: Hash,
    title: "Public Keys",
    color: "text-[#178fb5]",
    bg: "bg-[#e0f6ff]",
    border: "border-[#82cbe3]/70",
    content: (
      <>
        <p>
          Stellar public account IDs start with <code className="rounded border border-white/70 bg-white/60 px-1.5 py-0.5 text-xs font-bold text-[#172033]">G</code>. They are safe
          to share and are the only account identifiers this app accepts.
        </p>
        <p className="mt-3">
          <strong>Secret keys and seed phrases should never be entered into this app.</strong> A public key is like
          an email address — you give it out to receive funds. The secret key is like the password to that
          email and must stay private.
        </p>
      </>
    )
  },
  {
    icon: Network,
    title: "Testnet and Mainnet",
    color: "text-[#9a6754]",
    bg: "bg-[#fff7f1]",
    border: "border-[#ffd1c6]/80",
    content: (
      <>
        <p>
          <strong>Testnet</strong> is a sandbox Stellar network for development. Testnet XLM has no market
          value and can be requested through <strong>Friendbot</strong> — the faucet helper you&apos;ll find
          in this toolkit. Testnet resets periodically, so treat it as a scratchpad.
        </p>
        <p className="mt-3">
          <strong>Mainnet</strong> is the live Stellar network with real XLM. The app can query mainnet
          Horizon for balances, trustlines, and transactions, but the faucet remains testnet-only to avoid
          any risk of real fund loss.
        </p>
      </>
    )
  },
  {
    icon: Radio,
    title: "Horizon",
    color: "text-[#17664b]",
    bg: "bg-[#e1f8ef]",
    border: "border-[#70c7a7]/70",
    content: (
      <>
        <p>
          <strong>Horizon</strong> is Stellar&apos;s HTTP API. It&apos;s the bridge between this app and
          the Stellar network. When you check a balance or look up a transaction, the app calls a Horizon
          server that reads from the Stellar ledger and returns the data.
        </p>
        <p className="mt-3">
          This project uses Horizon via the <code className="rounded border border-white/70 bg-white/60 px-1.5 py-0.5 text-xs font-bold text-[#172033]">stellar-sdk</code>{" "}
          library to load account balances, trustlines, and transaction summaries. You can switch between
          testnet and mainnet Horizon servers using the network toggle in the header.
        </p>
      </>
    )
  },
  {
    icon: Star,
    title: "Native XLM",
    color: "text-[#7a5b45]",
    bg: "bg-[#f5efe8]",
    border: "border-[#d4b99a]/70",
    content: (
      <>
        <p>
          <strong>XLM</strong> (Lumens) is Stellar&apos;s native asset. It serves as the base currency
          for transaction fees and network operations. Unlike issued assets, XLM does not have an issuer
          address — it is native to the Stellar network itself.
        </p>
        <p className="mt-3">
          Every Stellar account must maintain a minimum XLM balance (the <strong>base reserve</strong>,
          currently 1 XLM) to exist on the ledger. Additional XLM is required when opening trustlines,
          which is why funded accounts show a small XLM balance even before receiving any transfers.
        </p>
      </>
    )
  },
  {
    icon: ShieldCheck,
    title: "Issued Assets and Trustlines",
    color: "text-[#17664b]",
    bg: "bg-[#e1f8ef]",
    border: "border-[#70c7a7]/70",
    content: (
      <>
        <p>
          Issued assets on Stellar have two identifying properties: an <strong>asset code</strong> (like
          USDC or yBTC) and an <strong>issuer account</strong> (the public key of the organization or
          person that created the asset).
        </p>
        <p className="mt-3">
          Before an account can hold most issued assets, it must <strong>create a trustline</strong> to
          that specific asset and issuer. A trustline is like a handshake — it signals that the account
          trusts the issuer and is willing to hold that asset.
        </p>
        <p className="mt-3">
          The <strong>Trustline Checker</strong> tool in this app asks for three pieces of information:
        </p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-[#4e5c73]">
          <li>Account address (the public key starting with G)</li>
          <li>Asset code (e.g. USDC, yBTC)</li>
          <li>Issuer address (the public key of the asset creator)</li>
        </ul>
      </>
    )
  },
  {
    icon: ArrowLeftRight,
    title: "Transactions",
    color: "text-[#7a3f8a]",
    bg: "bg-[#f3eaf8]",
    border: "border-[#c7b9f3]/75",
    content: (
      <>
        <p>
          Stellar transactions are identified by <strong>64-character hexadecimal hashes</strong>. These
          hashes look like a long string of letters and numbers (0-9, a-f) and uniquely identify each
          transaction submitted to the network.
        </p>
        <p className="mt-3">
          The <strong>Transaction Lookup</strong> tool validates the hash format before querying Horizon,
          providing a clear error if the hash doesn&apos;t look right. Once found, the tool displays the
          transaction details and links to{" "}
          <a
            href="https://stellar.expert/"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-[#178fb5] underline decoration-[#82cbe3]/50 hover:decoration-[#178fb5]"
          >
            Stellar Expert
          </a>{" "}
          for deeper inspection.
        </p>
      </>
    )
  },
  {
    icon: Wallet,
    title: "Wallets",
    color: "text-[#9a6754]",
    bg: "bg-[#fff7f1]",
    border: "border-[#ffd1c6]/80",
    content: (
      <>
        <p>
          <strong>Freighter</strong> is a browser wallet extension for the Stellar network. It lets you
          manage Stellar accounts, sign transactions, and interact with Stellar apps directly from your
          browser.
        </p>
        <p className="mt-3">
          When you connect Freighter to this app, the app <strong>only</strong> requests your public key
          and network information. It does not request signatures, secret keys, or transaction submission.
          The <strong>Freighter Connect</strong> tool demonstrates this safe, read-only interaction
          pattern.
        </p>
      </>
    )
  }
];

export default function StellarBasicsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <CharacterPanel
        tone="star"
        eyebrow="Star teacher"
        title="Stellar Basics"
        description="The star teacher opens a chalkboard and explains the Stellar concepts this toolkit works with — from public keys and trustlines to Horizon and the testnet."
      >
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/tools/testnet-faucet"
            className="inline-flex items-center gap-2 rounded-md border border-[#82cbe3]/80 bg-white/60 px-3 py-2 text-sm font-extrabold text-[#178fb5] hover:bg-[#e0f6ff]"
          >
            Try the testnet faucet
          </Link>
          <Link
            href="/tools/trustline-checker"
            className="inline-flex items-center gap-2 rounded-md border border-[#ffd1c6]/80 bg-white/60 px-3 py-2 text-sm font-extrabold text-[#9a6754] hover:bg-[#fff7f1]"
          >
            Check a trustline
          </Link>
        </div>
      </CharacterPanel>

      <div className="space-y-5">
        {sections.map(({ icon: Icon, title, color, bg, border, content }) => (
          <Card key={title} className="overflow-hidden">
            <div className="flex items-start gap-4 sm:items-center">
              <span
                className={`grid h-12 w-12 shrink-0 place-items-center rounded-lg border ${border} ${bg} ${color} shadow-[5px_5px_0_rgba(255,139,122,0.28)]`}
              >
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <h2 className="text-lg font-semibold text-[#172033]">{title}</h2>
            </div>
            <div className="mt-4 border-t border-[#c7d6e8]/40 pt-4 text-sm leading-6 text-[#4e5c73]">
              {content}
            </div>
          </Card>
        ))}
      </div>

      <Card className="border-[#c7b9f3]/75 bg-[#f3eaf8]/50">
        <div className="flex items-start gap-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/60">
            <BookOpen className="h-5 w-5 text-[#7a3f8a]" aria-hidden />
          </span>
          <div>
            <p className="text-sm font-extrabold text-[#7a3f8a]">Want to learn more?</p>
            <p className="mt-1 text-sm leading-6 text-[#4e5c73]">
              The official{" "}
              <a
                href="https://stellar.org/developers"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-[#178fb5] underline decoration-[#82cbe3]/50 hover:decoration-[#178fb5]"
              >
                Stellar Developers
              </a>{" "}
              portal and{" "}
              <a
                href="https://developers.stellar.org/docs"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-[#178fb5] underline decoration-[#82cbe3]/50 hover:decoration-[#178fb5]"
              >
                Stellar Documentation
              </a>{" "}
              are excellent resources for deeper dives into the protocol.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
