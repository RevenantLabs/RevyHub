export interface SpendableProjection {
  spendableStroops: bigint | null;
  belowMinimum: boolean;
  shortfallStroops: bigint | null;
}

/**
 * Spendable balance is the starting balance above the minimum.
 * A missing starting balance leaves the projection unset. A shortfall clamps
 * spendable to zero instead of going negative.
 */
export function projectSpendableBalance(
  minimumBalanceStroops: bigint,
  startingBalanceStroops: bigint | null
): SpendableProjection {
  if (startingBalanceStroops === null) {
    return { spendableStroops: null, belowMinimum: false, shortfallStroops: null };
  }

  if (startingBalanceStroops < minimumBalanceStroops) {
    return {
      spendableStroops: 0n,
      belowMinimum: true,
      shortfallStroops: minimumBalanceStroops - startingBalanceStroops
    };
  }

  return {
    spendableStroops: startingBalanceStroops - minimumBalanceStroops,
    belowMinimum: false,
    shortfallStroops: 0n
  };
}
