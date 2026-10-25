import Image from "next/image";
import Link from "next/link";

function MailIcon() {
  return (
    <svg
      className="contact-icon"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 7 9-7" />
    </svg>
  );
}

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label="INDEX FUND home">
        <Image
          src="/images/brand/header-logo.webp"
          alt="INDEX FUND"
          width={120}
          height={62}
          className="brand-logo"
          style={{ width: 120, height: "auto", maxHeight: 48 }}
          priority
        />
      </Link>
      <div className="header-end">
        <nav className="nav" aria-label="Primary">
          <a href="/#calculator">Calculator</a>
          <Link href="/funds">Funds</Link>
          <Link href="/guides/how-it-works">Methodology</Link>
          <Link href="/guides/dca-strategy">DCA guide</Link>
          <Link href="/guides/expense-ratios">Fees</Link>
          <Link href="/guides/sp500-returns">S&P 500</Link>
        </nav>
        <a
          className="contact-link"
          href="mailto:indexfundcalc@gmail.com"
          title="Contact support — indexfundcalc@gmail.com"
        >
          <MailIcon />
          <span className="contact-label">Support</span>
        </a>
      </div>
    </header>
  );
}
