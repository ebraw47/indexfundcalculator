import type { Metadata } from "next";
import Link from "next/link";
import { MARKET_STATS, RESEARCH_SOURCES } from "@/data/benchmarks";
import { INDEX_FUNDS } from "@/data/funds";
import { WORKED_EXAMPLES as W } from "@/data/worked-examples";
import { usd } from "@/lib/format";

export const metadata: Metadata = {
  title: "Expense Ratio Guide — How Fund Fees Change Index Fund Results",
  description:
    "What an expense ratio is, how it compounds against your index fund calculator results, and fee comparisons across popular ETFs and mutual funds.",
};

export default function ExpenseRatiosPage() {
  const sorted = [...INDEX_FUNDS].sort((a, b) => a.expenseRatio - b.expenseRatio);

  return (
    <article className="section prose longform">
      <h1>Expense ratios and your index fund calculator</h1>
      <p className="lede">
        Fees look tiny as percentages and enormous as decades of missed
        compounding. This guide explains the metric, how IndexPath subtracts it,
        and what public fund menus actually charge.
      </p>

      <h2>Definition</h2>
      <p>
        Expense ratio = annual operating expenses ÷ average net assets. A 0.03%
        ratio is about $3 per year on a static $10,000 balance; 1.00% is about
        $100. In practice the asset base changes every day as markets move and
        you contribute, so the dollar fee is not a fixed invoice — but the
        percentage still drains the base that can compound tomorrow.
      </p>
      <p>
        Fund total returns reported by issuers are generally <em>already net</em>{" "}
        of the expense ratio. When you paste a historical net return into a
        calculator, do not subtract the ER again unless you are starting from a
        gross index return. IndexPath’s presets use planning gross returns and
        then subtract the ER explicitly so you can stress-test fees.
      </p>

      <h2>What the fee table usually includes (and excludes)</h2>
      <ul>
        <li>
          <strong>Often inside ER:</strong> management, index licensing,
          administration, some distribution costs.
        </li>
        <li>
          <strong>Outside ER:</strong> your broker commissions (often $0 on major
          ETFs), bid-ask spread when you trade, taxes on dividends/gains, and
          sometimes temporary waivers that can expire.
        </li>
      </ul>

      <h2>Index vs active cost bands</h2>
      <p>
        Broad U.S. equity index products frequently price near{" "}
        {MARKET_STATS.typicalIndexExpenseLow}%–
        {MARKET_STATS.typicalIndexExpenseHigh}%. Many actively managed funds still
        charge near {MARKET_STATS.typicalActiveExpense}% or more. Over long
        horizons, academic and industry summaries repeatedly find that a majority
        of active funds lag their benchmarks after fees — which is why Bogleheads
        philosophy centers cost control, not manager storytelling.
      </p>

      <h2>Calculator stress test (same contributions)</h2>
      <p>
        {usd(W.plan.initial)} + {usd(W.plan.monthly)}/mo × {W.plan.years} years at
        a {W.plan.grossReturn}% equity assumption:
      </p>
      <ul>
        <li>0.03% ER path ≈ {usd(W.lowFee.finalBalance)}</li>
        <li>0.50% ER path ≈ {usd(W.midFee.finalBalance)}</li>
        <li>1.00% ER path ≈ {usd(W.highFee.finalBalance)}</li>
        <li>
          Wealth gap 0.03% vs 1.00% ≈ <strong>{usd(W.feeGapLowVsHigh)}</strong>
        </li>
      </ul>
      <p>
        Try it yourself: open the{" "}
        <Link href="/#calculator">index fund calculator</Link>, lock every input,
        and only edit expense ratio.
      </p>

      <h2>Expense ratios in our fund database</h2>
      <div className="table-wrap funds-table">
        <table>
          <thead>
            <tr>
              <th>Ticker</th>
              <th>Fund</th>
              <th>ER</th>
              <th>Category</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((f) => (
              <tr key={f.ticker}>
                <td>{f.ticker}</td>
                <td>{f.name}</td>
                <td>{f.expenseRatio.toFixed(3)}%</td>
                <td>{f.category}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        Note SPY (0.09%) vs VOO/IVV (0.03%): same S&P 500 exposure class, different
        fee. Liquidity traders may still prefer SPY; long-term buy-and-hold
        allocators usually prefer the cheaper share class when tracking is
        comparable.
      </p>

      <h2>Sources</h2>
      <ul>
        {RESEARCH_SOURCES.filter((s) =>
          /expense|Bogle|DCA|Vanguard/i.test(s.title),
        ).map((s) => (
          <li key={s.url}>
            <a href={s.url} target="_blank" rel="noopener noreferrer">
              {s.title}
            </a>{" "}
            — {s.note}
          </li>
        ))}
      </ul>
    </article>
  );
}
