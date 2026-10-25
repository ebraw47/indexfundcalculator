import type { Metadata } from "next";
import Link from "next/link";
import { MARKET_STATS, RESEARCH_SOURCES } from "@/data/benchmarks";
import { INDEX_FUNDS } from "@/data/funds";
import { WORKED_EXAMPLES as W } from "@/data/worked-examples";
import { usd } from "@/lib/format";

export const metadata: Metadata = {
  title: "DCA Into Index Funds — Strategy Guide & Calculator Tips",
  description:
    "How dollar-cost averaging into index funds works, which funds beginners use in 2026, account types (Roth, 401k, taxable), and how to project returns with IndexPath.",
};

export default function DcaStrategyPage() {
  const usCore = INDEX_FUNDS.filter((f) =>
    ["VTI", "VOO", "FSKAX", "FZROX", "SWTSX", "FXAIX"].includes(f.ticker),
  );
  const intl = INDEX_FUNDS.filter((f) =>
    ["VXUS", "VEA", "VWO"].includes(f.ticker),
  );

  return (
    <article className="section prose longform">
      <h1>Dollar-cost averaging into index funds</h1>
      <p className="lede">
        DCA is the paycheck-native way to buy the market: fixed dollars on a
        schedule, no timing thesis required. Pair it with low-cost index funds
        and a horizon measured in decades.
      </p>

      <h2>Why index funds fit DCA</h2>
      <p>
        Averaging works best when the asset has a long-run upward earnings drift
        and enough volatility that some purchases land at lower prices. Broad
        equity indexes historically satisfy both better than concentrated stock
        picks. A single company can fail; a total-market fund represents thousands
        of businesses. Practitioner explainers emphasize that consistency and cost
        minimization beat ticker perfectionism.
      </p>

      <h2>Common fund menus (2026 education consensus)</h2>
      <h3>U.S. core</h3>
      <ul>
        {usCore.map((f) => (
          <li key={f.ticker}>
            <strong>{f.ticker}</strong> — {f.name} (ER {f.expenseRatio}%) —{" "}
            {f.notes}
          </li>
        ))}
      </ul>
      <h3>International sleeve</h3>
      <ul>
        {intl.map((f) => (
          <li key={f.ticker}>
            <strong>{f.ticker}</strong> — {f.name} (ER {f.expenseRatio}%) —{" "}
            {f.notes}
          </li>
        ))}
      </ul>
      <p>
        Simple templates: (1) 100% VTI/FSKAX-style total market, or (2) ~70–80%
        U.S. + 20–30% VXUS, or (3) add BND as ballast when you need lower
        volatility. See the full{" "}
        <Link href="/funds">fund data table</Link>.
      </p>

      <h2>Setup checklist</h2>
      <ol className="steps">
        <li>Open a low-cost brokerage (Vanguard, Fidelity, Schwab, etc.).</li>
        <li>
          Prioritize accounts: capture 401(k) match → Roth IRA if eligible →
          remaining tax-advantaged → taxable brokerage.
        </li>
        <li>Choose one or two index funds, not twenty themes.</li>
        <li>Automate bank transfer + automatic investment on payday.</li>
        <li>Rebalance about annually if allocations drift.</li>
      </ol>

      <h2>Tax framing (high level)</h2>
      <ul>
        <li>
          <strong>Roth IRA:</strong> post-tax contributions; qualified growth and
          withdrawals tax-free — powerful for decades of compounding.
        </li>
        <li>
          <strong>Traditional 401(k):</strong> pre-tax deferral + match; withdrawals
          taxed as ordinary income later.
        </li>
        <li>
          <strong>Taxable:</strong> no contribution cap; dividends/realized gains
          can be taxable yearly. Index funds’ low turnover helps, but does not
          erase tax.
        </li>
      </ul>
      <p>IndexPath projections are pre-tax — adjust mentally for account type.</p>

      <h2>Projecting DCA returns without fooling yourself</h2>
      <p>
        Constant-return calculators correctly show the compounding shape of
        steady contributions. They do not show sequence risk. Educators often
        recommend ~{MARKET_STATS.planningRealReturn}% as a real planning rate or ~
        {MARKET_STATS.planningNominalReturn}% nominal with inflation modeled
        separately. On IndexPath’s low-fee 30-year demo (
        {usd(W.plan.initial)} + {usd(W.plan.monthly)}/mo), the engine prints ≈{" "}
        {usd(W.lowFee.finalBalance)} nominal / {usd(W.lowFee.realBalance)} real —
        useful for order-of-magnitude planning, not destiny.
      </p>
      <p>
        Run your numbers in the{" "}
        <Link href="/#calculator">index fund calculator</Link>, then read{" "}
        <Link href="/guides/how-it-works">methodology</Link> for formula detail.
      </p>

      <h2>FAQ</h2>
      <details>
        <summary>Is DCA better than picking stocks?</summary>
        <p>
          For most individuals, broad index DCA removes stock-selection and
          manager-selection risk. Long-horizon studies frequently find a majority
          of active funds lag benchmarks after fees.
        </p>
      </details>
      <details>
        <summary>How long should I keep DCA-ing?</summary>
        <p>
          Through the accumulation years. Near retirement, many plans gradually
          raise bond allocation to reduce sequence risk in the withdrawal window —
          that glide path is outside this calculator’s scope but belongs in your
          written plan.
        </p>
      </details>
      <details>
        <summary>Can I DCA stocks and bonds together?</summary>
        <p>
          Yes. Example moderate mix: 80–90% equity index + 10–20% bond index,
          rebalanced yearly. Use BND (or similar) as the bond sleeve in IndexPath
          presets when you want a lower expected-return assumption.
        </p>
      </details>

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
