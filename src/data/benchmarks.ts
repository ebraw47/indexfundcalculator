/** Educational market reference data for the Index Fund Calculator. */

export const SP500_ANNUAL_RETURNS: { year: number; returnPct: number }[] = [
  { year: 2025, returnPct: 17.82 },
  { year: 2024, returnPct: 25.02 },
  { year: 2023, returnPct: 26.29 },
  { year: 2022, returnPct: -18.11 },
  { year: 2021, returnPct: 30.92 },
  { year: 2020, returnPct: 18.4 },
  { year: 2019, returnPct: 31.49 },
  { year: 2018, returnPct: -4.38 },
  { year: 2017, returnPct: 21.83 },
  { year: 2016, returnPct: 11.96 },
  { year: 2015, returnPct: 1.36 },
  { year: 2014, returnPct: 13.52 },
  { year: 2013, returnPct: 32.15 },
  { year: 2012, returnPct: 15.89 },
  { year: 2011, returnPct: 2.1 },
  { year: 2010, returnPct: 14.82 },
  { year: 2009, returnPct: 25.94 },
  { year: 2008, returnPct: -36.55 },
  { year: 2007, returnPct: 5.48 },
  { year: 2006, returnPct: 15.61 },
  { year: 2005, returnPct: 4.83 },
  { year: 2004, returnPct: 10.74 },
  { year: 2003, returnPct: 28.36 },
  { year: 2002, returnPct: -21.97 },
  { year: 2001, returnPct: -11.85 },
  { year: 2000, returnPct: -9.03 },
];

export const MARKET_STATS = {
  /** Long-run arithmetic-style means cited in public education sources */
  sp500LongTermMean: 11.9,
  /** Investopedia-style: ~10.5% nominal since modern S&P era; ~6.7% real */
  sp500Since1957Nominal: 10.5,
  sp500Since1957Real: 6.7,
  sp500Last25Mean: 10.5,
  sp500Last10Mean: 16.1,
  /** Vanguard 500 Index (VFINX) inception through Mar 2026 (issuer disclosure) */
  vanguard500SinceInception: 11.44,
  sp500BenchmarkSameWindow: 11.68,
  usInflationLongTerm: 3.0,
  typicalIndexExpenseLow: 0.03,
  typicalIndexExpenseHigh: 0.2,
  typicalActiveExpense: 0.85,
  /** Common planning defaults used by DCA education sites */
  planningNominalReturn: 10,
  planningRealReturn: 7,
  historicalDividendYieldSpx: 1.5,
};

export const RESEARCH_SOURCES = [
  {
    title: "S&P 500 average returns (Investopedia)",
    note: "Long-run nominal ~10.5% since 1957; real ~6.7% after inflation.",
    url: "https://www.investopedia.com/ask/answers/042415/what-average-annual-return-sp-500.asp",
  },
  {
    title: "Vanguard: 50 years of indexing",
    note: "VFINX ~11.44% annualized since inception vs S&P ~11.68% same window (as of Mar 2026 disclosure).",
    url: "https://corporate.vanguard.com/content/corporatesite/us/en/corp/articles/50-years-50-facts-indexing-since-1976.html",
  },
  {
    title: "Bogleheads investment philosophy",
    note: "Diversify, keep costs low, invest early/often, prefer simple index portfolios.",
    url: "https://www.bogleheads.org/wiki/Bogleheads%C2%AE_investment_philosophy",
  },
  {
    title: "DCA into index funds — strategy & fund picks",
    note: "Why total-market funds suit DCA; Roth/401(k)/taxable account framing; 7% real vs 10% nominal planning.",
    url: "https://wildandfreetools.com/blog/dca-index-funds-strategy-calculator/",
  },
  {
    title: "Expense ratio impact on compounding",
    note: "Fees reduce NAV and forgo future growth; compare identical plans at two expense ratios.",
    url: "https://quantflowlab.com/expense-ratio/",
  },
] as const;

export function meanReturn(years: number): number {
  const slice = SP500_ANNUAL_RETURNS.slice(0, years);
  if (!slice.length) return MARKET_STATS.sp500LongTermMean;
  return slice.reduce((s, r) => s + r.returnPct, 0) / slice.length;
}
