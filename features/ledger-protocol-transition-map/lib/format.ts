import type { StellarNetwork } from "@/core/network/types";
import type {
  ProtocolLedger,
  ProtocolRun,
  ProtocolTransition
} from "@/features/ledger-protocol-transition-map/types";

const NETWORK_LABELS: Record<StellarNetwork, string> = {
  testnet: "Testnet",
  mainnet: "Mainnet"
};

export function formatNetworkLabel(network: StellarNetwork): string {
  return NETWORK_LABELS[network];
}

export function formatRange(start: string, end: string): string {
  return `#${start} → #${end}`;
}

export function formatRunLabel(run: ProtocolRun): string {
  return `v${run.protocolVersion} · ${formatRange(run.startSequence, run.endSequence)} (${run.ledgerCount})`;
}

export function formatTransitionLabel(transition: ProtocolTransition): string {
  return `v${transition.fromVersion} → v${transition.toVersion} at #${transition.beforeSequence}/#${transition.afterSequence}`;
}

export function buildSummaryText(args: {
  network: StellarNetwork;
  start: string;
  end: string;
  observed: number;
  transitions: ProtocolTransition[];
}): string {
  const lines = [
    `network=${args.network}`,
    `range=#${args.start}-#${args.end}`,
    `observed=${args.observed}`,
    `transitions=${args.transitions.length}`
  ];

  for (const transition of args.transitions) {
    lines.push(
      `${transition.certainty}:${transition.fromVersion}->${transition.toVersion}@${transition.beforeSequence}/${transition.afterSequence}`
    );
  }

  return lines.join("\n");
}

export function formatLedgerRow(ledger: ProtocolLedger): string {
  return `#${ledger.sequence} · protocol ${ledger.protocolVersion}`;
}
