/** A realistic Horizon `/fee_stats` payload. */
export const calmFeeStats = {
  last_ledger: "1017696",
  last_ledger_base_fee: "100",
  ledger_capacity_usage: "0.08",
  fee_charged: {
    max: "100", min: "100", mode: "100",
    p10: "100", p20: "100", p30: "100", p40: "100", p50: "100",
    p60: "100", p70: "100", p80: "100", p90: "100", p95: "100", p99: "100"
  },
  max_fee: {
    max: "100000", min: "100", mode: "10000",
    p10: "100", p20: "1000", p30: "5000", p40: "10000", p50: "10000",
    p60: "10000", p70: "20000", p80: "50000", p90: "100000", p95: "100000", p99: "100000"
  }
};

export const congestedFeeStats = {
  ...calmFeeStats,
  ledger_capacity_usage: "0.97",
  fee_charged: {
    max: "35000", min: "100", mode: "1200",
    p10: "150", p20: "300", p30: "500", p40: "800", p50: "1200",
    p60: "1800", p70: "2600", p80: "4000", p90: "9000", p95: "18000", p99: "35000"
  }
};

export const busyFeeStats = { ...calmFeeStats, ledger_capacity_usage: "0.61" };

/** Horizon occasionally omits capacity; the tool must degrade, not fail. */
export const noCapacityFeeStats = { ...calmFeeStats, ledger_capacity_usage: undefined };

export const malformedFeeStats = { something: "else" };
