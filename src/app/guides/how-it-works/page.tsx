import type { Metadata } from "next";
import Link from "next/link";
import {
  MARKET_STATS,
  RESEARCH_SOURCES,
  SP500_ANNUAL_RETURNS,
  meanReturn,
} from "@/data/benchmarks";
import { WORKED_EXAMPLES as W } from "@/data/worked-examples";
import { usd } from "@/lib/format";

export const metadata: Metadata = {
  title: "How the Index Fund Calculator Works — Formulas & Limits",
  description:
    "IndexPath methodology: net return after fees and DRIP, contribution step-ups, inflation adjustment, worked examples, and an honest self-analysis vs historical backtests.",
};

export default function HowItWorksPage() {
  const last10 = meanReturn(10);
  const last25 = meanReturn(25);

  return (
    <article className="section prose longform">
      <h1>How the index fund calculator works</h1>
      <p className="lede">
        IndexPath projects a contribution plan under a constant net annual
        return. This page documents the math, the defaults, a worked numerical
        example from the engine, and where the model intentionally stops.
      </p>

      <h2>1. Inputs</h2>
      <ul>
        <li>Initial balance (lump sum at t₀)</li>
        <li>Recurring contribution and frequency (weekly → annually)</li>
        <li>Horizon in years</li>
        <li>Expected annual return (gross price/total-return assumption)</li>
        <li>Expense ratio (%)</li>
        <li>Dividend yield (%) and DRIP toggle</li>
        <li>Inflation (%) for real purchasing-power display</li>
        <li>Annual contribution step-up (%)</li>
      </ul>

      <h2>2. Net return used each period</h2>
      <pre className="formula">{`grossAnnual = expectedReturn
             + (DRIP ? dividendYield : 0)
netAnnual   = grossAnnual − expenseRatio
periodRate  = (1 + netAnnual)^(1/periodsPerYear) − 1`}</pre>
      <p>
        Example: 10% expected + 1.1% DRIP − 0.03% ER ≈ 11.07% net before we
        convert to a monthly (or other) period rate. This matches how
        educational DCA calculators describe “return + dividend − expense”
        stacks. It is a planning simplification, not a NAV accounting replica.
      </p>

      <h2>3. Period loop</h2>
      <p>For each contribution period:</p>
      <ol>
        <li>Grow the current balance by <code>periodRate</code>.</li>
        <li>Add the current contribution.</li>
        <li>
          After a full year of periods, optionally multiply the contribution by{" "}
          <code>(1 + stepUp)</code> for the next year.
        </li>
      </ol>
      <p>
        Classic closed-form annuity math (
        <code>FV = PMT × [((1+r)^n − 1) / r]</code>) is equivalent for fixed
        contributions and constant r. We simulate period-by-period so step-ups
        and mixed frequencies stay readable.
      </p>

      <h2>4. Inflation adjustment</h2>
      <pre className="formula">{`realBalance = nominalBalance / (1 + inflation)^years`}</pre>
      <p>
        Default inflation {MARKET_STATS.usInflationLongTerm}% mirrors a common
        long-run U.S. planning assumption. Turning inflation up does not change
        the nominal path — only the real readout.
      </p>

      <h2>5. Engine check (worked example)</h2>
      <p>
        Plan: {usd(W.plan.initial)} initial + {usd(W.plan.monthly)}/month for{" "}
        {W.plan.years} years, {W.plan.grossReturn}% return, {W.plan.dripYield}%
        DRIP, 0.03% ER, {MARKET_STATS.usInflationLongTerm}% inflation.
      </p>
      <ul>
        <li>Projected nominal balance: {usd(W.lowFee.finalBalance)}</li>
        <li>Total contributed: {usd(W.lowFee.contributed)}</li>
        <li>Estimated gains: {usd(W.lowFee.gains)}</li>
        <li>Inflation-adjusted: {usd(W.lowFee.realBalance)}</li>
        <li>
          Same plan at 1.00% ER (DRIP off in that stress):{" "}
          {usd(W.highFee.finalBalance)} — gap ≈ {usd(W.feeGapLowVsHigh)}
        </li>
      </ul>

      <h2>6. Self-analysis vs internet tools</h2>
      <p>
        Feature survey of popular “index fund / DCA calculator” pages shows a
        split product landscape:
      </p>
      <ul>
        <li>
          <strong>Projection calculators</strong> (NerdWallet-style compound
          interest, IndexPath): fast what-if on contribution + rate + fees.
        </li>
        <li>
          <strong>Historical backtesters</strong> (SPY DCA since 1993-style
          tools): replay real prices, IRR, drawdowns, DCA vs lump sum on past
          data.
        </li>
        <li>
          <strong>Fee impact calculators</strong>: hold return fixed and isolate
          two expense ratios — the comparison we surface in the home worked
          table.
        </li>
      </ul>
      <p>
        IndexPath is firmly in the projection + fee-education camp. We
        deliberately do not pretend constant 10% years recreate 2008 (−36.55% in
        our series) or 2022 ({SP500_ANNUAL_RETURNS.find((r) => r.year === 2022)?.returnPct}
        %). Sequence-of-returns risk, taxes, and ETF microstructure are called
        out as out-of-scope so users do not over-trust a smooth chart.
      </p>

      <h2>7. S&P 500 context embedded in the product</h2>
      <p>
        Recent window means from our annual series: last 10 years ≈{" "}
        {last10.toFixed(1)}%; coverage through 2000 ≈ {last25.toFixed(1)}%.
        External long-run citations we reference: ~{" "}
        {MARKET_STATS.sp500Since1957Nominal}% nominal / ~{" "}
        {MARKET_STATS.sp500Since1957Real}% real (Investopedia education summary);
        Vanguard 500 Index Fund Investor Shares ~{" "}
        {MARKET_STATS.vanguard500SinceInception}% annualized since inception vs
        index ~{MARKET_STATS.sp500BenchmarkSameWindow}% (issuer March 2026
        disclosure window).
      </p>

      <div className="table-wrap funds-table" style={{ marginTop: "1rem" }}>
        <table>
          <thead>
            <tr>
              <th>Year</th>
              <th>S&P 500 total return %</th>
            </tr>
          </thead>
          <tbody>
            {SP500_ANNUAL_RETURNS.map((r) => (
              <tr key={r.year}>
                <td>{r.year}</td>
                <td>{r.returnPct.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>8. Related guides</h2>
      <ul>
        <li>
          <Link href="/guides/expense-ratios">Expense ratios deep dive</Link>
        </li>
        <li>
          <Link href="/guides/dca-strategy">DCA into index funds</Link>
        </li>
        <li>
          <Link href="/guides/sp500-returns">S&P 500 returns explained</Link>
        </li>
        <li>
          <Link href="/funds">Fund data table</Link>
        </li>
      </ul>

      <h2>9. Sources</h2>
      <ul>
        {RESEARCH_SOURCES.map((s) => (
          <li key={s.url}>
            <a href={s.url} target="_blank" rel="noopener noreferrer">
              {s.title}
            </a>{" "}
            — {s.note}
          </li>
        ))}
      </ul>

      <h2>Disclaimer</h2>
      <p>
        Educational only. Not advice. Data can lag. Confirm prospectus figures
        before investing.
      </p>
    </article>
  );
}
