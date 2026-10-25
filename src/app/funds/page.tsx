import type { Metadata } from "next";
import Link from "next/link";
import { RESEARCH_SOURCES } from "@/data/benchmarks";
import { INDEX_FUNDS } from "@/data/funds";
import { formatPct } from "@/lib/calculate";

export const metadata: Metadata = {
  title: "Index Fund Data — ETFs & Mutual Funds Compared",
  description:
    "Compare VOO, VTI, VXUS, QQQ, FZROX, FXAIX and more: expense ratios, yields, planning returns, AUM, and notes for the IndexPath calculator.",
};

export default function FundsPage() {
  const byCat = INDEX_FUNDS.reduce<Record<string, typeof INDEX_FUNDS>>(
    (acc, f) => {
      (acc[f.category] ??= []).push(f);
      return acc;
    },
    {},
  );

  return (
    <section className="section">
      <div className="prose longform" style={{ maxWidth: "48rem" }}>
        <h1
          style={{
            fontFamily: "var(--font-display), Georgia, serif",
            letterSpacing: "-0.03em",
            fontSize: "clamp(2rem, 4vw, 2.8rem)",
            marginBottom: "0.5rem",
          }}
        >
          Index fund data library
        </h1>
        <p style={{ color: "var(--muted)" }}>
          Curated presets powering the{" "}
          <Link href="/#calculator">index fund calculator</Link>. Expense ratios,
          yields, and AUM are approximate public figures for education — always
          confirm on the issuer prospectus. “Plan return” is our long-term
          modeling default, not a forecast.
        </p>
        <p>
          How to read this page: pick a category that matches your IPS (U.S.
          large, total market, international, bonds). Prefer the lowest ER that
          still tracks the benchmark you want. Then load the ticker in the
          calculator and stress fees / contribution size.
        </p>
      </div>

      <div className="table-wrap funds-table" style={{ marginTop: "1.25rem" }}>
        <table>
          <thead>
            <tr>
              <th>Ticker</th>
              <th>Fund</th>
              <th>Category</th>
              <th>ER</th>
              <th>Yield</th>
              <th>Plan return</th>
              <th>AUM</th>
              <th>Inception</th>
            </tr>
          </thead>
          <tbody>
            {INDEX_FUNDS.map((f) => (
              <tr key={f.ticker}>
                <td>
                  <strong>{f.ticker}</strong>
                </td>
                <td>
                  {f.name}
                  <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                    {f.issuer} · {f.benchmark}
                  </div>
                </td>
                <td>{f.category}</td>
                <td>{formatPct(f.expenseRatio)}</td>
                <td>{formatPct(f.dividendYield, 1)}</td>
                <td>{formatPct(f.expectedReturn, 1)}</td>
                <td>${f.aumBillions}B</td>
                <td>{f.inception}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {Object.entries(byCat).map(([cat, funds]) => (
        <div key={cat} className="section" style={{ paddingTop: "1.5rem" }}>
          <h2 style={{ fontFamily: "var(--font-display), Georgia, serif" }}>
            {cat}
          </h2>
          {funds.map((f) => (
            <div key={f.ticker} className="fund-card">
              <h3>
                {f.ticker} — {f.name}
              </h3>
              <p>{f.notes}</p>
              <p className="fund-meta">
                ER {formatPct(f.expenseRatio)} · Div ~{formatPct(f.dividendYield, 1)} ·
                Planning return {formatPct(f.expectedReturn, 1)} · Benchmark{" "}
                {f.benchmark}
              </p>
            </div>
          ))}
        </div>
      ))}

      <div className="prose longform" style={{ marginTop: "1rem" }}>
        <h2>Data notes</h2>
        <ul>
          <li>
            FZROX’s 0% ER is a Fidelity-account feature; it is not a claim that
            all investing is free (spreads/taxes still exist).
          </li>
          <li>
            QQQ’s higher planning return reflects Nasdaq-100 history — and
            larger drawdowns (see 2000–2002 and 2022 in public return tables).
          </li>
          <li>
            Bond fund (BND) planning returns are much lower than equity; use it
            for ballast modeling, not equity replacement.
          </li>
        </ul>
        <h2>Sources informing this catalog</h2>
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
      </div>
    </section>
  );
}
