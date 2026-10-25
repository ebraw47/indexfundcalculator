import type { Metadata } from "next";
import Link from "next/link";
import {
  MARKET_STATS,
  RESEARCH_SOURCES,
  SP500_ANNUAL_RETURNS,
  meanReturn,
} from "@/data/benchmarks";

export const metadata: Metadata = {
  title: "S&P 500 Historical Returns — Data for Index Fund Calculators",
  description:
    "S&P 500 average returns, annual total-return table, nominal vs real, and how to choose an expected return inside an index fund calculator.",
};

export default function Sp500ReturnsPage() {
  const last5 = meanReturn(5);
  const last10 = meanReturn(10);
  const last25 = meanReturn(Math.min(25, SP500_ANNUAL_RETURNS.length));
  const best = SP500_ANNUAL_RETURNS.reduce((a, b) =>
    a.returnPct > b.returnPct ? a : b,
  );
  const worst = SP500_ANNUAL_RETURNS.reduce((a, b) =>
    a.returnPct < b.returnPct ? a : b,
  );

  return (
    <article className="section prose longform">
      <h1>S&P 500 historical returns (for calculator users)</h1>
      <p className="lede">
        Your index fund calculator is only as honest as the return assumption you
        type. Here is how public sources describe S&P 500 history — and how our
        bundled annual series behaves.
      </p>

      <h2>Headline averages (external education sources)</h2>
      <ul>
        <li>
          Roughly <strong>{MARKET_STATS.sp500Since1957Nominal}%</strong> average
          annual nominal return since the modern S&P 500 era, and about{" "}
          <strong>{MARKET_STATS.sp500Since1957Real}%</strong> after inflation
          (Investopedia summary figures).
        </li>
        <li>
          Longer published histories often land near ~10% nominal / ~7% real
          depending on start date and whether dividends are included.
        </li>
        <li>
          Vanguard 500 Index Fund Investor Shares: about{" "}
          <strong>{MARKET_STATS.vanguard500SinceInception}%</strong> annualized
          since inception through March 2026 disclosures, vs{" "}
          <strong>{MARKET_STATS.sp500BenchmarkSameWindow}%</strong> for the index
          in the same window — illustrating tight tracking net of costs.
        </li>
      </ul>

      <h2>Means from IndexPath’s annual table</h2>
      <ul>
        <li>Last 5 years (arithmetic mean of annual %): {last5.toFixed(1)}%</li>
        <li>Last 10 years: {last10.toFixed(1)}%</li>
        <li>Full bundled window: {last25.toFixed(1)}%</li>
        <li>
          Best year in table: {best.year} ({best.returnPct}%)
        </li>
        <li>
          Worst year in table: {worst.year} ({worst.returnPct}%)
        </li>
      </ul>
      <p>
        Notice the last-decade mean sits well above the long-run ~10% education
        figure. Anchoring a 40-year retirement plan only to the last 10 years is
        a common optimism bias. Prefer{" "}
        {MARKET_STATS.planningNominalReturn}% nominal or{" "}
        {MARKET_STATS.planningRealReturn}% real-style unless you have a reasoned
        alternative.
      </p>

      <h2>Annual total returns (bundled)</h2>
      <div className="table-wrap funds-table">
        <table>
          <thead>
            <tr>
              <th>Year</th>
              <th>Return %</th>
            </tr>
          </thead>
          <tbody>
            {SP500_ANNUAL_RETURNS.map((r) => (
              <tr key={r.year}>
                <td>{r.year}</td>
                <td style={{ color: r.returnPct < 0 ? "var(--danger)" : undefined }}>
                  {r.returnPct.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>How to map this into the calculator</h2>
      <ol className="steps">
        <li>
          Choose a VOO / IVV / SPY / FXAIX preset on the{" "}
          <Link href="/#calculator">calculator</Link>.
        </li>
        <li>
          Set expected return to {MARKET_STATS.planningNominalReturn}% (optimistic
          long-run) or {MARKET_STATS.planningRealReturn}% (conservative /
          real-style).
        </li>
        <li>
          Keep ER at 0.03% (VOO/IVV class) unless modeling SPY (0.09%) or an
          active fund.
        </li>
        <li>
          Enable DRIP with ~{MARKET_STATS.historicalDividendYieldSpx}% if you want
          dividend compounding in the net rate.
        </li>
        <li>
          Compare inflation-adjusted output so a large nominal number does not
          fool you.
        </li>
      </ol>

      <h2>Concentration caveat</h2>
      <p>
        Commentators increasingly note that a larger share of index returns can
        come from a smaller set of mega-cap firms. The S&P 500 remains a
        diversified large-cap basket, but it is not “equal weight America.” Total
        market funds (VTI) add mid/small caps; international funds (VXUS) add
        non-U.S. growth. Diversification choices belong in your IPS; the
        calculator only prices the return/fee assumption you select.
      </p>

      <h2>Sources</h2>
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
    </article>
  );
}
