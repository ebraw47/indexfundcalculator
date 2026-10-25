/** Precomputed IndexPath scenarios for educational copy (matches calculateIndexFund). */
export const WORKED_EXAMPLES = {
  plan: {
    initial: 10000,
    monthly: 500,
    years: 30,
    grossReturn: 10,
    dripYield: 1.1,
  },
  lowFee: {
    label: "Low-cost S&P 500 style (0.03% ER + DRIP)",
    expenseRatio: 0.03,
    finalBalance: 1503800,
    contributed: 190000,
    gains: 1313800,
    realBalance: 619546,
  },
  midFee: {
    label: "0.50% expense ratio (no DRIP in model)",
    expenseRatio: 0.5,
    finalBalance: 1088793,
    contributed: 190000,
    gains: 898793,
  },
  highFee: {
    label: "1.00% expense ratio (active-fund-like fee)",
    expenseRatio: 1.0,
    finalBalance: 983733,
    contributed: 190000,
    gains: 793733,
  },
  feeGapLowVsHigh: 1503800 - 983733, // ~520k
  real7NoInflationAdj: {
    label: "7% real-style constant return, 30y",
    finalBalance: 656989,
  },
  withStepUp3: {
    label: "3% annual contribution step-up",
    finalBalance: 1864709,
    contributed: 295452,
  },
  years10: { finalBalance: 134256, contributed: 70000 },
  years20: { finalBalance: 489301, contributed: 130000 },
} as const;
