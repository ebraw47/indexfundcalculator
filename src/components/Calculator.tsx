"use client";

import {
  useCallback,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { INDEX_FUNDS } from "@/data/funds";
import {
  calculateIndexFund,
  formatMoney,
  formatPct,
  type Frequency,
} from "@/lib/calculate";
import type { DetectedFields, HoldingSlice } from "@/lib/parse-statement";
import { DocumentUpload } from "./DocumentUpload";
import { GrowthChart } from "./GrowthChart";



const SELECT_WRAP: CSSProperties = {
  position: "relative",
  width: "100%",
};

const SELECT_STYLE: CSSProperties = {
  width: "100%",
  appearance: "none",
  WebkitAppearance: "none",
  MozAppearance: "none",
  paddingRight: "2.75rem",
  cursor: "pointer",
};

const CHEVRON_STYLE: CSSProperties = {
  position: "absolute",
  right: 0,
  top: 0,
  bottom: 0,
  width: "2.75rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  pointerEvents: "none",
  color: "#5c3428",
  borderLeft: "1px solid rgba(92, 52, 40, 0.18)",
};

function FieldSelect({
  value,
  onChange,
  "aria-label": ariaLabel,
  children,
}: {
  value: string | number;
  onChange: (value: string) => void;
  "aria-label"?: string;
  children: ReactNode;
}) {
  return (
    <div className="fund-select-wrap" style={SELECT_WRAP}>
      <select
        value={String(value)}
        aria-label={ariaLabel}
        onChange={(e) => onChange(e.target.value)}
        style={SELECT_STYLE}
      >
        {children}
      </select>
      <span aria-hidden style={CHEVRON_STYLE}>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </span>
    </div>
  );
}

function withCurrent(options: number[], current: number): number[] {
  const set = new Set(options);
  if (Number.isFinite(current)) set.add(current);
  return [...set].sort((a, b) => a - b);
}

const INITIAL_OPTS = [0, 1000, 2500, 5000, 10000, 25000, 50000, 100000, 250000];
const CONTRIB_OPTS = [0, 50, 100, 200, 250, 500, 750, 1000, 1500, 2000, 5000];
const YEARS_OPTS = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
const RETURN_OPTS = [4, 5, 6, 7, 8, 8.5, 8.9, 9, 10, 11, 12, 15];
const ER_OPTS = [0, 0.015, 0.02, 0.025, 0.03, 0.05, 0.07, 0.09, 0.1, 0.18, 0.2, 0.5, 0.75, 1];
const YIELD_OPTS = [0, 0.5, 1, 1.1, 1.5, 1.68, 2, 2.5, 2.8, 3, 3.5, 4];
const INFLATION_OPTS = [0, 1, 2, 2.5, 3, 3.5, 4, 5, 6];
const STEPUP_OPTS = [0, 1, 2, 2.5, 3, 4, 5, 7.5, 10];

const FREQUENCIES: { value: Frequency; label: string }[] = [
  { value: "monthly", label: "Monthly" },
  { value: "biweekly", label: "Bi-weekly" },
  { value: "weekly", label: "Weekly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "annually", label: "Annually" },
];

export function Calculator() {
  const [ticker, setTicker] = useState("VOO");
  const fund = INDEX_FUNDS.find((f) => f.ticker === ticker) ?? INDEX_FUNDS[0];
  const [initial, setInitial] = useState(10000);
  const [contribution, setContribution] = useState(500);
  const [frequency, setFrequency] = useState<Frequency>("monthly");
  const [years, setYears] = useState(25);
  const [annualReturn, setAnnualReturn] = useState(fund.expectedReturn);
  const [expense, setExpense] = useState(fund.expenseRatio);
  const [divYield, setDivYield] = useState(fund.dividendYield);
  const [drip, setDrip] = useState(true);
  const [inflation, setInflation] = useState(3);
  const [stepUp, setStepUp] = useState(0);
  const [importNote, setImportNote] = useState("");
  const [holdings, setHoldings] = useState<HoldingSlice[]>([]);
  const [applyFlash, setApplyFlash] = useState(false);

  function applyFund(nextTicker: string) {
    const next = INDEX_FUNDS.find((f) => f.ticker === nextTicker);
    if (!next) return;
    setTicker(next.ticker);
    setHoldings([]);
    setAnnualReturn(next.expectedReturn);
    setExpense(next.expenseRatio);
    setDivYield(next.dividendYield);
    setImportNote("");
  }

  const applyDetected = useCallback((fields: DetectedFields) => {
    const next =
      (fields.ticker &&
        INDEX_FUNDS.find((f) => f.ticker === fields.ticker)) ||
      undefined;

    const initialVal = fields.initial ?? 10000;
    const contributionVal = fields.contribution ?? 500;
    const frequencyVal = fields.frequency ?? "monthly";
    const yearsVal = fields.years ?? 25;
    const returnVal = fields.annualReturn ?? next?.expectedReturn ?? 10;
    const expenseVal = fields.expenseRatio ?? next?.expenseRatio ?? 0.03;
    const yieldVal = fields.dividendYield ?? next?.dividendYield ?? 1.1;
    const inflationVal = fields.inflation ?? 3;
    const stepUpVal = fields.stepUp ?? 0;
    const dripVal = fields.drip ?? true;
    const holdingRows = (fields.holdings ?? []).filter((h) => h.weightPct > 0);

    if (next) setTicker(next.ticker);
    setHoldings(holdingRows);
    setInitial(initialVal);
    setContribution(contributionVal);
    setFrequency(frequencyVal);
    setYears(yearsVal);
    setAnnualReturn(returnVal);
    setExpense(expenseVal);
    setDivYield(yieldVal);
    setInflation(inflationVal);
    setStepUp(stepUpVal);
    setDrip(dripVal);
    setApplyFlash(true);
    window.setTimeout(() => setApplyFlash(false), 1200);

    const mix =
      holdingRows.length > 1
        ? `Portfolio blend ${holdingRows
            .map((h) => `${h.ticker} ${h.weightPct}%`)
            .join(" + ")} → weighted ER ${expenseVal}%, return ${returnVal}%, yield ${yieldVal}%`
        : next
          ? `Single fund ${next.ticker} (ER ${expenseVal}%, return ${returnVal}%)`
          : "Detected fields";

    setImportNote(
      `${mix}. Cash-flow: $${initialVal} initial, $${contributionVal}/${frequencyVal}, ${yearsVal}y, inflation ${inflationVal}%, step-up ${stepUpVal}%.`,
    );
  }, []);

  const result = useMemo(
    () =>
      calculateIndexFund({
        initial,
        contribution,
        frequency,
        years,
        annualReturnPct: annualReturn,
        expenseRatioPct: expense,
        dividendYieldPct: divYield,
        reinvestDividends: drip,
        inflationPct: inflation,
        stepUpPct: stepUp,
      }),
    [
      initial,
      contribution,
      frequency,
      years,
      annualReturn,
      expense,
      divYield,
      drip,
      inflation,
      stepUp,
    ],
  );

  return (
    <div className="calculator-wrap" id="calculator">
      <DocumentUpload onApply={applyDetected} />
      {importNote && <p className="import-note">{importNote}</p>}

      {holdings.length > 0 && (
        <div className="portfolio-mix" aria-label="Detected portfolio allocation">
          <h3>Detected portfolio allocation</h3>
          <ul>
            {holdings.map((h) => (
              <li key={h.ticker}>
                <strong>{h.ticker}</strong> {h.weightPct}%
                <span>
                  {" "}
                  · ER {formatPct(h.expenseRatio)} · plan return{" "}
                  {formatPct(h.expectedReturn, 1)}
                </span>
              </li>
            ))}
          </ul>
          <p>
            Projection uses weighted ER {formatPct(expense)} and weighted return{" "}
            {formatPct(annualReturn, 1)}
            {holdings.length > 1 ? " (not a single-fund assumption)." : "."}
          </p>
        </div>
      )}

      <div className="calculator">
        <div className="calc-screen calc-screen--inputs" aria-label="Index fund calculator inputs">
          <div className="calc-screen-bezel">
            <div className="calc-screen-notch" aria-hidden />
            <div className="calc-screen-face">
              <header className="calc-screen-bar">
                <span className="calc-screen-dot" aria-hidden />
                <h2 className="calc-screen-title">Index Fund Calculator</h2>
                <span className="calc-screen-status" aria-hidden>LIVE</span>
              </header>
              <div className="calc-panel">
          <label className="field">
            <span>
              {holdings.length > 1
                ? "Primary fund preset (blend active)"
                : "Index fund preset"}
            </span>
            <FieldSelect
              value={ticker}
              aria-label="Select index fund"
              onChange={(v) => applyFund(v)}
            >
              {INDEX_FUNDS.map((f) => (
                <option key={f.ticker} value={f.ticker}>
                  {f.ticker} — {f.name}
                </option>
              ))}
            </FieldSelect>
          </label>

          <div className="field-grid">
            <label className="field">
              <span>Initial investment</span>
              <FieldSelect
                value={initial}
                aria-label="Initial investment"
                onChange={(v) => setInitial(Number(v) || 0)}
              >
                {withCurrent(INITIAL_OPTS, initial).map((n) => (
                  <option key={n} value={n}>
                    ${n.toLocaleString("en-US")}
                  </option>
                ))}
              </FieldSelect>
            </label>
            <label className="field">
              <span>Recurring contribution</span>
              <FieldSelect
                value={contribution}
                aria-label="Recurring contribution"
                onChange={(v) => setContribution(Number(v) || 0)}
              >
                {withCurrent(CONTRIB_OPTS, contribution).map((n) => (
                  <option key={n} value={n}>
                    ${n.toLocaleString("en-US")}
                  </option>
                ))}
              </FieldSelect>
            </label>
            <label className="field">
              <span>Frequency</span>
              <FieldSelect
                value={frequency}
                aria-label="Frequency"
                onChange={(v) => setFrequency(v as Frequency)}
              >
                {FREQUENCIES.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </FieldSelect>
            </label>
            <label className="field">
              <span>Years</span>
              <FieldSelect
                value={years}
                aria-label="Years"
                onChange={(v) => setYears(Number(v) || 1)}
              >
                {withCurrent(YEARS_OPTS, years).map((n) => (
                  <option key={n} value={n}>
                    {n} years
                  </option>
                ))}
              </FieldSelect>
            </label>
            <label className="field">
              <span>Expected annual return (%)</span>
              <FieldSelect
                value={annualReturn}
                aria-label="Expected annual return"
                onChange={(v) => setAnnualReturn(Number(v) || 0)}
              >
                {withCurrent(RETURN_OPTS, annualReturn).map((n) => (
                  <option key={n} value={n}>
                    {n}%
                  </option>
                ))}
              </FieldSelect>
            </label>
            <label className="field">
              <span>Expense ratio (%)</span>
              <FieldSelect
                value={expense}
                aria-label="Expense ratio"
                onChange={(v) => setExpense(Number(v) || 0)}
              >
                {withCurrent(ER_OPTS, expense).map((n) => (
                  <option key={n} value={n}>
                    {n}%
                  </option>
                ))}
              </FieldSelect>
            </label>
            <label className="field">
              <span>Dividend yield (%)</span>
              <FieldSelect
                value={divYield}
                aria-label="Dividend yield"
                onChange={(v) => setDivYield(Number(v) || 0)}
              >
                {withCurrent(YIELD_OPTS, divYield).map((n) => (
                  <option key={n} value={n}>
                    {n}%
                  </option>
                ))}
              </FieldSelect>
            </label>
            <label className="field">
              <span>Inflation (%)</span>
              <FieldSelect
                value={inflation}
                aria-label="Inflation"
                onChange={(v) => setInflation(Number(v) || 0)}
              >
                {withCurrent(INFLATION_OPTS, inflation).map((n) => (
                  <option key={n} value={n}>
                    {n}%
                  </option>
                ))}
              </FieldSelect>
            </label>
            <label className="field">
              <span>Annual contribution step-up (%)</span>
              <FieldSelect
                value={stepUp}
                aria-label="Annual contribution step-up"
                onChange={(v) => setStepUp(Number(v) || 0)}
              >
                {withCurrent(STEPUP_OPTS, stepUp).map((n) => (
                  <option key={n} value={n}>
                    {n}%
                  </option>
                ))}
              </FieldSelect>
            </label>
            <label className="field check">
              <input
                type="checkbox"
                checked={drip}
                onChange={(e) => setDrip(e.target.checked)}
              />
              <span>Reinvest dividends (DRIP)</span>
            </label>
          </div>

          <p className="fund-hint">
            {fund.ticker}: {fund.notes} Benchmark {fund.benchmark}. ER{" "}
            {formatPct(fund.expenseRatio)}.
          </p>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`calc-screen calc-screen--results${applyFlash ? " is-flash" : ""}`}
          id="calc-results"
          aria-live="polite"
          aria-label="Projected balance screen"
        >
          <div className="calc-screen-bezel">
            <div className="calc-screen-notch" aria-hidden />
            <div className="calc-screen-face calc-screen-face--results">
              <header className="calc-screen-bar calc-screen-bar--results">
                <span className="calc-screen-dot calc-screen-dot--accent" aria-hidden />
                <h2 className="calc-screen-title">Projected Balance</h2>
                <span className="calc-screen-status" aria-hidden>OUT</span>
              </header>
              <div className="calc-results">
          <div className="kpi-row">
            <div>
              <span className="kpi-label">Projected balance</span>
              <strong className="kpi-value">
                {formatMoney(result.finalBalance)}
              </strong>
            </div>
            <div>
              <span className="kpi-label">Inflation-adjusted</span>
              <strong className="kpi-value">
                {formatMoney(result.finalBalanceReal)}
              </strong>
            </div>
            <div>
              <span className="kpi-label">Total contributed</span>
              <strong className="kpi-value">
                {formatMoney(result.totalContributed)}
              </strong>
            </div>
            <div>
              <span className="kpi-label">Estimated gains</span>
              <strong className="kpi-value gain">
                {formatMoney(result.totalGains)}
              </strong>
            </div>
          </div>

          <GrowthChart
            rows={result.rows}
            contributed={result.totalContributed}
          />

          <p className="result-meta">
            Net effective return ~{formatPct(result.effectiveAnnualReturn)} after
            expense ratio
            {drip ? " with DRIP" : ""}. Illustrative fee drag over the horizon:{" "}
            {formatMoney(result.totalFees)}.
          </p>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Contributions</th>
                  <th>End balance</th>
                  <th>Real (infl.-adj.)</th>
                </tr>
              </thead>
              <tbody>
                {result.rows
                  .filter(
                    (_, i) =>
                      i === 0 ||
                      (i + 1) % 5 === 0 ||
                      i === result.rows.length - 1,
                  )
                  .map((row) => (
                    <tr key={row.year}>
                      <td>{row.year}</td>
                      <td>{formatMoney(row.contributions)}</td>
                      <td>{formatMoney(row.endBalance)}</td>
                      <td>{formatMoney(row.endBalanceReal)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
