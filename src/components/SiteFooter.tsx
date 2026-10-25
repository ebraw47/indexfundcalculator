import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <p>
        <strong>INDEX FUND</strong> is an educational index fund calculator. Not
        financial, tax, or investment advice. Past performance does not guarantee
        future results. Figures cite public education sources and may lag live
        prospectus data.
      </p>
      <div className="footer-links">
        <a href="mailto:indexfundcalc@gmail.com">indexfundcalc@gmail.com</a>
        <Link href="/funds">Fund data</Link>
        <Link href="/guides/how-it-works">Methodology</Link>
        <Link href="/guides/dca-strategy">DCA guide</Link>
        <Link href="/guides/expense-ratios">Fees</Link>
        <Link href="/guides/sp500-returns">S&P 500</Link>
      </div>
    </footer>
  );
}
