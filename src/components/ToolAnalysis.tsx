import Link from "next/link";

export function ToolAnalysis() {
  return (
    <section className="section analysis-block">
      <h2>Self-analysis: what this index fund calculator does well — and what it does not</h2>
      <p>
        We built IndexPath against the features users expect from modern “index fund
        calculator” / DCA tools (contribution schedules, expense ratios, DRIP,
        inflation, step-ups, fund presets). Here is an honest product audit so you
        know how to read the numbers.
      </p>

      <div className="analysis-grid">
        <div>
          <h3>Covered today</h3>
          <ul>
            <li>Lump sum + recurring contributions (weekly → annually)</li>
            <li>Net return after expense ratio, optional dividend reinvestment</li>
            <li>Inflation-adjusted ending balance and contribution step-ups</li>
            <li>Fund presets with planning returns (VOO, VTI, VXUS, QQQ, bonds, Fidelity/Schwab mutual funds)</li>
            <li>Year-path table + growth chart for the modeled constant-return path</li>
          </ul>
        </div>
        <div>
          <h3>Not modeled (by design, for now)</h3>
          <ul>
            <li>Daily historical price backtests (SPY tick data / crash path replay)</li>
            <li>Sequence-of-returns risk (bad years early vs late)</li>
            <li>Taxes, tax-loss harvesting, or Roth vs traditional withdrawal math</li>
            <li>Bid-ask spreads, commissions, or premium/discount on ETF shares</li>
            <li>Goal-seek “how much must I save for $X?” reverse solver</li>
          </ul>
        </div>
      </div>

      <p>
        Competitor tools that emphasize historical DCA backtests answer “what would
        have happened?” IndexPath answers “if my average net return is R, what does
        my contribution plan look like?” Both are useful; they are different
        questions. For planning, many educators suggest ~10% nominal or ~7% real
        long-run equity assumptions and treating the output as a range, not a promise.
        Read the{" "}
        <Link href="/guides/how-it-works">methodology</Link>,{" "}
        <Link href="/guides/dca-strategy">DCA guide</Link>, and{" "}
        <Link href="/guides/sp500-returns">S&P 500 returns</Link> pages for context
        pulled from public market education sources.
      </p>
    </section>
  );
}
