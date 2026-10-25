import { Calculator } from "@/components/Calculator";
import { ToolAnalysis } from "@/components/ToolAnalysis";
import { MARKET_STATS, RESEARCH_SOURCES, SP500_ANNUAL_RETURNS } from "@/data/benchmarks";
import { INDEX_FUNDS } from "@/data/funds";
import { WORKED_EXAMPLES as W } from "@/data/worked-examples";
import { usd } from "@/lib/format";
import Link from "next/link";

export default function HomePage() {
  const recentBear = SP500_ANNUAL_RETURNS.find((r) => r.year === 2022);
  const fundCount = INDEX_FUNDS.length;

  return (
    <>
      <section className="hero">
        <h1 className="hero-title">
          <span className="hero-title-index">Index Fund</span>
          <span className="hero-title-fund">Calculator</span>
        </h1>
        <p className="hero-sub">
          Free index fund calculator for dollar cost averaging, expense ratios,
          DRIP, and inflation. Built for the search intent behind index fund
          calculator, with real fund presets and transparent methodology.
        </p>
      </section>

      <Calculator />

      <ToolAnalysis />

      <section className="section">
        <h2>Worked example: $10,000 + $500/month for 30 years</h2>
        <p>
          Same contribution plan, different fee assumptions. Gross equity return
          set to {W.plan.grossReturn}% with ~{W.plan.dripYield}% dividend yield
          reinvested on the low-fee path (typical S&P 500 ETF planning setup).
          Total cash invested without step-ups: {usd(W.lowFee.contributed)}.
        </p>
        <div className="table-wrap funds-table">
          <table>
            <thead>
              <tr>
                <th>Scenario</th>
                <th>Expense ratio</th>
                <th>Projected balance</th>
                <th>Estimated gains</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{W.lowFee.label}</td>
                <td>{W.lowFee.expenseRatio}%</td>
                <td>{usd(W.lowFee.finalBalance)}</td>
                <td>{usd(W.lowFee.gains)}</td>
              </tr>
              <tr>
                <td>{W.midFee.label}</td>
                <td>{W.midFee.expenseRatio}%</td>
                <td>{usd(W.midFee.finalBalance)}</td>
                <td>{usd(W.midFee.gains)}</td>
              </tr>
              <tr>
                <td>{W.highFee.label}</td>
                <td>{W.highFee.expenseRatio}%</td>
                <td>{usd(W.highFee.finalBalance)}</td>
                <td>{usd(W.highFee.gains)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Gap between the 0.03% path and the 1.00% path in this illustration: about{" "}
          <strong>{usd(W.feeGapLowVsHigh)}</strong>. That is not “fees billed on a
          statement” alone — it is fees plus the growth those dollars never earn.
          Inflation-adjusted value of the low-fee ending balance at{" "}
          {MARKET_STATS.usInflationLongTerm}% inflation ≈ {usd(W.lowFee.realBalance)}.
          With a 3% annual contribution step-up (salary-raise style), the same
          low-fee path projects ≈ {usd(W.withStepUp3.finalBalance)} on{" "}
          {usd(W.withStepUp3.contributed)} contributed.
        </p>
        <p>
          Shorter horizons on the same low-fee inputs: 10 years ≈{" "}
          {usd(W.years10.finalBalance)} (contributed {usd(W.years10.contributed)});
          20 years ≈ {usd(W.years20.finalBalance)} (contributed{" "}
          {usd(W.years20.contributed)}). Time in market dominates the math.
        </p>
      </section>

      <section className="section">
        <h2>What is an index fund calculator?</h2>
        <p>
          An index fund calculator estimates how a portfolio tracking a market
          benchmark (S&P 500, total U.S. market, international equities, bonds)
          could grow when you combine an initial investment with regular
          contributions. Unlike a stock-picking fantasy spreadsheet, it focuses on
          the levers that matter for passive investors: contribution size,
          frequency, years invested, expected long-run return, dividend
          reinvestment, and — critically — the fund’s expense ratio.
        </p>
        <p>
          Index funds and ETFs aim to match an index rather than beat it. That
          rules-based design keeps costs low and holdings transparent. Vanguard’s
          public history of indexing notes that index funds seek to replicate
          target indexes on a net-of-expenses basis; their Vanguard 500 Index Fund
          Investor Shares posted about {MARKET_STATS.vanguard500SinceInception}%
          annualized since inception through March 2026 disclosures, trailing the
          S&P 500’s {MARKET_STATS.sp500BenchmarkSameWindow}% in the same window —
          the gap largely reflecting costs and tracking, not stock-picking drama.
        </p>
        <p>
          Public education summaries (e.g. Investopedia) place long-run S&P 500
          average annual returns near {MARKET_STATS.sp500Since1957Nominal}%
          nominal since the modern index era, or roughly{" "}
          {MARKET_STATS.sp500Since1957Real}% after inflation. Those are averages
          across wildly different years — including {recentBear?.year} at{" "}
          {recentBear?.returnPct}% in our bundled series. A calculator that shows
          a smooth curve is showing the <em>mean path</em>, not the lived path.
        </p>
      </section>

      <section className="section">
        <h2>How to use this tool (step by step)</h2>
        <ol className="steps">
          <li>
            <strong>Pick a fund preset</strong> — Start with VOO or VTI for U.S.
            equity core, VXUS for international, BND for ballast, or QQQ if you
            want a Nasdaq-100 planning assumption (higher historical return, higher
            drawdowns). We ship {fundCount} presets under{" "}
            <Link href="/funds">Fund data</Link>.
          </li>
          <li>
            <strong>Enter cash flows</strong> — Initial buy-in, recurring amount,
            and frequency. Monthly is the default for paycheck-aligned DCA.
          </li>
          <li>
            <strong>Set the return stack</strong> — Expected annual return,
            expense ratio, dividend yield, and whether dividends reinvest (DRIP).
            For conservative planning, try {MARKET_STATS.planningRealReturn}% and
            treat it as a real return, or use {MARKET_STATS.planningNominalReturn}%
            nominal with the inflation toggle on.
          </li>
          <li>
            <strong>Read both balances</strong> — Nominal ending value answers
            “what might the account say?” Inflation-adjusted value answers “what
            might that buy?”
          </li>
          <li>
            <strong>Stress the fee</strong> — Change only the expense ratio from
            0.03% to 0.75–1.00% and watch the terminal value gap. That experiment
            is the heart of index-fund education.
          </li>
        </ol>
      </section>

      <section className="section">
        <h2>Dollar-cost averaging into index funds</h2>
        <p>
          Dollar-cost averaging (DCA) means investing a fixed amount on a schedule
          regardless of price. You buy more shares when prices are depressed and
          fewer when they are elevated. For DCA to help long-term outcomes, the
          asset generally needs a positive long-run drift plus enough volatility
          for averaging to matter — conditions broad equity indexes have
          historically met better than single stocks (a company can go to zero; a
          total-market fund cannot without a systemic collapse of listed
          businesses).
        </p>
        <p>
          Practitioner guides commonly recommend a single total-market fund (VTI,
          FSKAX, SWTSX, or Fidelity’s 0% FZROX where available) or a two-fund US +
          international split. The fund ticker matters less than contribution
          consistency and cost control. Automate the transfer the day after
          payday, rebalance about once a year, and prefer tax-advantaged accounts
          (Roth IRA / 401(k) match) before taxable brokerage when eligible.
        </p>
        <p>
          Full walkthrough:{" "}
          <Link href="/guides/dca-strategy">DCA strategy guide</Link>.
        </p>
      </section>

      <section className="section">
        <h2>Why expense ratios dominate long horizons</h2>
        <p>
          An expense ratio is annual fund operating cost as a percent of assets
          (about $3 per $10,000 at 0.03%; $100 per $10,000 at 1.00%). Fees usually
          come out of NAV rather than as a separate brokerage bill, so they are
          easy to ignore — until compounding makes them impossible to ignore.
        </p>
        <p>
          Important nuance from fee research: published fund total returns are
          already net of the expense ratio. Do not subtract the ER again from a
          net historical return unless you are building a gross-to-net model like
          this calculator. Also remember bid-ask spreads, trading costs inside the
          fund, and taxes are separate from the headline ER.
        </p>
        <p>
          Broad U.S. index ETFs often charge roughly{" "}
          {MARKET_STATS.typicalIndexExpenseLow}%–
          {MARKET_STATS.typicalIndexExpenseHigh}%, while many active funds still
          cluster near {MARKET_STATS.typicalActiveExpense}% or higher. Over 20–30
          years that gap compounds into six figures on ordinary contribution
          plans — see the worked table above and the{" "}
          <Link href="/guides/expense-ratios">expense ratio guide</Link>.
        </p>
      </section>

      <section className="section">
        <h2>Index investing principles (Bogleheads-style)</h2>
        <p>
          Community summaries of John Bogle’s philosophy emphasize living below
          your means, writing a simple plan, matching risk to the ability to hold
          through drawdowns, investing early and often, diversifying broadly,
          preferring index funds, and keeping costs (and taxes) low. A practical
          expression is the three-fund portfolio: U.S. total stock, international
          stock, and U.S. total bond — or even two funds (total stock + total bond)
          for many investors. Simplicity lowers behavioral error rates: fewer
          products to chase, fewer reasons to abandon the plan in a crash.
        </p>
        <p>
          IndexPath does not replace an investment policy statement. It helps you
          quantify the contribution and fee assumptions inside that plan.
        </p>
      </section>

      <section className="section">
        <h2>Market data snapshot used on this site</h2>
        <ul>
          <li>
            Bundled S&P 500 annual total-return series (recent window mean, 10y):{" "}
            {(
              SP500_ANNUAL_RETURNS.slice(0, 10).reduce((s, r) => s + r.returnPct, 0) /
              10
            ).toFixed(1)}
            %
          </li>
          <li>
            Planning defaults: {MARKET_STATS.planningNominalReturn}% nominal /{" "}
            {MARKET_STATS.planningRealReturn}% real-style; inflation{" "}
            {MARKET_STATS.usInflationLongTerm}%
          </li>
          <li>
            Typical dividend yield assumption for S&P-style DRIP demos: ~{" "}
            {MARKET_STATS.historicalDividendYieldSpx}%
          </li>
          <li>
            Fund catalog size: {fundCount} tickers with ER, yield, and planning
            return fields
          </li>
        </ul>
        <p>
          Deeper history and caveats:{" "}
          <Link href="/guides/sp500-returns">S&P 500 returns guide</Link>.
        </p>
      </section>

      <section className="section faq">
        <h2>Index fund calculator FAQ</h2>
        <details open>
          <summary>How does this index fund calculator work?</summary>
          <p>
            Each contribution period, the balance compounds at a period rate
            derived from net annual return (expected return + optional dividend
            yield if DRIP is on − expense ratio). Then the contribution is added.
            Optional step-ups raise the contribution once per year. Results show
            nominal balance, inflation-adjusted balance, total contributed, gains,
            and a year table.
          </p>
        </details>
        <details>
          <summary>What return rate should I enter?</summary>
          <p>
            There is no correct single number. Long-run U.S. equity education
            sources often cite roughly {MARKET_STATS.sp500Since1957Nominal}%
            nominal or ~{MARKET_STATS.sp500Since1957Real}% real. Many DCA guides
            suggest {MARKET_STATS.planningRealReturn}% as a conservative
            inflation-adjusted planning rate, or ~
            {MARKET_STATS.planningNominalReturn}% nominal with a separate
            inflation assumption. Recent decades can look higher — our last-10
            mean in the bundled series is elevated versus the long run — so using
            only the last decade can overstate expectations.
          </p>
        </details>
        <details>
          <summary>Is dollar-cost averaging better than investing a lump sum?</summary>
          <p>
            Academic and industry comparisons often find lump-sum investing wins
            more often in rising markets because capital is invested sooner. DCA
            remains valuable as a behavioral and cash-flow tool: it matches how
            paychecks arrive and reduces regret from investing everything before a
            drawdown. This calculator models the DCA cash-flow path; it does not
            declare a universal winner.
          </p>
        </details>
        <details>
          <summary>Should I reinvest dividends?</summary>
          <p>
            For accumulation portfolios, yes in most cases. DRIP buys additional
            shares and compounds. S&P 500 dividend yields have often hovered near
            1–2% in recent decades; turning DRIP off in the model removes that
            yield from the growth rate.
          </p>
        </details>
        <details>
          <summary>Does the calculator include taxes?</summary>
          <p>
            No. Roth, traditional, and taxable accounts change after-tax outcomes
            dramatically. Index funds are relatively tax-efficient in taxable
            accounts due to low turnover, but dividends and realized gains can
            still create annual tax bills. Treat IndexPath figures as pre-tax
            illustrations.
          </p>
        </details>
        <details>
          <summary>Why don’t results match a historical SPY backtest site?</summary>
          <p>
            Backtests use actual daily/monthly prices and dividends. We use a
            constant expected return for planning clarity. Constant-return models
            miss sequence risk and crash shapes; price backtests miss your future
            unknown path. Use both styles if you need richer intuition.
          </p>
        </details>
        <details>
          <summary>Which index fund is best for beginners?</summary>
          <p>
            A single U.S. total-market fund (VTI / FSKAX / SWTSX / FZROX) or S&P
            500 fund (VOO / FXAIX / IVV) is the usual starting point, paired with
            automation and a long horizon. Add international (VXUS) and bonds
            (BND) as your risk plan requires — not because a calculator demands
            more tickers.
          </p>
        </details>
      </section>

      <section className="section">
        <h2>Sources & further reading</h2>
        <ul className="source-list">
          {RESEARCH_SOURCES.map((s) => (
            <li key={s.url}>
              <a href={s.url} rel="noopener noreferrer" target="_blank">
                {s.title}
              </a>
              — {s.note}
            </li>
          ))}
        </ul>
        <p className="fineprint">
          Educational content only. Not financial, tax, or investment advice.
          Verify live expense ratios and yields on issuer sites before investing.
          Past performance does not guarantee future results.
        </p>
      </section>
    </>
  );
}
