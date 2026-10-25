export type Frequency = "monthly" | "biweekly" | "weekly" | "quarterly" | "annually";

export type CalculatorInput = {
  initial: number;
  contribution: number;
  frequency: Frequency;
  years: number;
  annualReturnPct: number;
  expenseRatioPct: number;
  dividendYieldPct: number;
  reinvestDividends: boolean;
  inflationPct: number;
  stepUpPct: number;
};

export type YearRow = {
  year: number;
  contributions: number;
  fees: number;
  endBalance: number;
  endBalanceReal: number;
};

export type CalculatorResult = {
  finalBalance: number;
  finalBalanceReal: number;
  totalContributed: number;
  totalGains: number;
  totalFees: number;
  effectiveAnnualReturn: number;
  rows: YearRow[];
};

const PERIODS_PER_YEAR: Record<Frequency, number> = {
  weekly: 52,
  biweekly: 26,
  monthly: 12,
  quarterly: 4,
  annually: 1,
};

export function calculateIndexFund(input: CalculatorInput): CalculatorResult {
  const periods = PERIODS_PER_YEAR[input.frequency];
  const totalPeriods = Math.max(1, Math.round(input.years * periods));
  const grossAnnual =
    input.annualReturnPct / 100 +
    (input.reinvestDividends ? input.dividendYieldPct / 100 : 0);
  const feeAnnual = input.expenseRatioPct / 100;
  const netAnnual = Math.max(-0.99, grossAnnual - feeAnnual);
  const periodRate = Math.pow(1 + netAnnual, 1 / periods) - 1;
  const inflationAnnual = input.inflationPct / 100;
  const stepUp = input.stepUpPct / 100;

  let balance = Math.max(0, input.initial);
  let contributed = Math.max(0, input.initial);
  let fees = 0;
  let contribution = Math.max(0, input.contribution);
  const rows: YearRow[] = [];

  let yearContrib = Math.max(0, input.initial);
  let yearFees = 0;
  let periodInYear = 0;

  for (let p = 1; p <= totalPeriods; p++) {
    const before = balance;
    balance *= 1 + periodRate;
    // Approximate fee drag already in net rate; track illustrative fee amount
    const grossGrowth = before * (Math.pow(1 + grossAnnual, 1 / periods) - 1);
    const netGrowth = balance - before;
    yearFees += Math.max(0, grossGrowth - netGrowth);
    fees += Math.max(0, grossGrowth - netGrowth);

    balance += contribution;
    contributed += contribution;
    yearContrib += contribution;
    periodInYear += 1;

    if (periodInYear >= periods || p === totalPeriods) {
      const yearIndex = rows.length + 1;
      const inflationFactor = Math.pow(1 + inflationAnnual, yearIndex);
      rows.push({
        year: yearIndex,
        contributions: yearContrib,
        fees: yearFees,
        endBalance: balance,
        endBalanceReal: balance / inflationFactor,
      });
      yearContrib = 0;
      yearFees = 0;
      periodInYear = 0;
      contribution *= 1 + stepUp;
    }
  }

  const finalBalance = balance;
  const years = Math.max(input.years, 1 / periods);
  const finalBalanceReal = finalBalance / Math.pow(1 + inflationAnnual, years);

  return {
    finalBalance,
    finalBalanceReal,
    totalContributed: contributed,
    totalGains: finalBalance - contributed,
    totalFees: fees,
    effectiveAnnualReturn: netAnnual * 100,
    rows,
  };
}

export function formatMoney(n: number, digits = 0): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(Number.isFinite(n) ? n : 0);
}

export function formatPct(n: number, digits = 2): string {
  return `${n.toFixed(digits)}%`;
}
