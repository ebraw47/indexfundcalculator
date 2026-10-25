import { INDEX_FUNDS, getFund } from "@/data/funds";
import type { Frequency } from "@/lib/calculate";

export type HoldingSlice = {
  ticker: string;
  weightPct: number;
  expenseRatio: number;
  expectedReturn: number;
  dividendYield: number;
};

export type DetectedFields = {
  ticker?: string;
  initial?: number;
  contribution?: number;
  frequency?: Frequency;
  years?: number;
  annualReturn?: number;
  expenseRatio?: number;
  dividendYield?: number;
  inflation?: number;
  stepUp?: number;
  drip?: boolean;
  /** Multi-fund election allocations (weights > 0). */
  holdings?: HoldingSlice[];
};

export type ParseResult = {
  fields: DetectedFields;
  matches: { field: string; value: string; evidence: string }[];
};

function moneyToNumber(raw: string): number | undefined {
  const cleaned = raw.replace(/[,$\s]/g, "").replace(/[()]/g, "");
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n < 0) return undefined;
  return n;
}

function pctToNumber(raw: string): number | undefined {
  const n = Number(raw.replace(/%/g, "").trim());
  if (!Number.isFinite(n)) return undefined;
  return n;
}

function pushMatch(
  matches: ParseResult["matches"],
  field: string,
  value: string,
  evidence: string,
) {
  matches.push({ field, value, evidence: evidence.slice(0, 160) });
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}

/** Pull ticker + ER + allocation weight rows from election-style OCR text. */
export function extractHoldings(text: string): HoldingSlice[] {
  const normalized = text.replace(/\u00a0/g, " ").replace(/\s+/g, " ");
  const tickers = [...INDEX_FUNDS.map((f) => f.ticker)].sort(
    (a, b) => b.length - a.length,
  );
  const found = new Map<string, HoldingSlice>();

  for (const t of tickers) {
    const fund = getFund(t);
    if (!fund) continue;

    // [FXAIX] 0.015% [ 70 ]  OR  FXAIX … 0.015% … 70%
    const patterns = [
      new RegExp(
        `\\[?\\b${t}\\b\\]?[^\\d%]{0,40}?([0]?\\.\\d{1,4}|\\d\\.\\d{1,4})\\s*%[^\\d%]{0,30}?\\[?\\s*(\\d{1,3})\\s*\\]?\\s*%?`,
        "i",
      ),
      new RegExp(
        `\\b${t}\\b[^\\d]{0,80}?allocation[^\\d%]{0,12}(\\d{1,3})\\s*%[^\\d%]{0,40}?([0]?\\.\\d{1,4}|\\d\\.\\d{1,4})\\s*%`,
        "i",
      ),
      new RegExp(
        `\\b${t}\\b[^\\d%]{0,40}?([0]?\\.\\d{1,4}|\\d\\.\\d{1,4})\\s*%[^\\d%]{0,40}?allocation[^\\d%]{0,12}(\\d{1,3})\\s*%`,
        "i",
      ),
    ];

    for (const re of patterns) {
      const m = normalized.match(re);
      if (!m) continue;

      let er: number | undefined;
      let weight: number | undefined;

      // Pattern 2 has weight then ER
      if (re.source.includes("allocation") && re.source.indexOf("allocation") < re.source.lastIndexOf("(")) {
        // check group order from which pattern matched
      }

      if (m.length >= 3) {
        const a = pctToNumber(m[1]);
        const b = pctToNumber(m[2]);
        if (a === undefined || b === undefined) continue;
        // Heuristic: ER is usually < 5; allocation is usually >= 5 (or 0)
        if (a <= 5 && b <= 100 && (b >= 5 || b === 0)) {
          er = a;
          weight = b;
        } else if (b <= 5 && a <= 100) {
          er = b;
          weight = a;
        } else if (a <= 5) {
          er = a;
          weight = b;
        } else {
          weight = a;
          er = b;
        }
      }

      if (weight === undefined || weight <= 0 || weight > 100) continue;
      if (er === undefined || er < 0 || er > 5) er = fund.expenseRatio;

      found.set(t.toUpperCase(), {
        ticker: t.toUpperCase(),
        weightPct: weight,
        expenseRatio: er,
        expectedReturn: fund.expectedReturn,
        dividendYield: fund.dividendYield,
      });
      break;
    }
  }

  // Fallback: ticker with trailing [ weight ] only
  if (found.size === 0) {
    for (const t of tickers) {
      const fund = getFund(t);
      if (!fund) continue;
      const m = normalized.match(
        new RegExp(`\\b${t}\\b[^\\d]{0,40}?\\[\\s*(\\d{1,3})\\s*\\]`, "i"),
      );
      if (!m) continue;
      const weight = Number(m[1]);
      if (!(weight > 0 && weight <= 100)) continue;
      found.set(t.toUpperCase(), {
        ticker: t.toUpperCase(),
        weightPct: weight,
        expenseRatio: fund.expenseRatio,
        expectedReturn: fund.expectedReturn,
        dividendYield: fund.dividendYield,
      });
    }
  }

  return [...found.values()].sort((a, b) => b.weightPct - a.weightPct);
}

export function blendHoldings(holdings: HoldingSlice[]): {
  expenseRatio: number;
  annualReturn: number;
  dividendYield: number;
  primaryTicker: string;
} | null {
  if (!holdings.length) return null;
  const total = holdings.reduce((s, h) => s + h.weightPct, 0);
  if (total <= 0) return null;
  let er = 0;
  let ret = 0;
  let yld = 0;
  for (const h of holdings) {
    const w = h.weightPct / total;
    er += w * h.expenseRatio;
    ret += w * h.expectedReturn;
    yld += w * h.dividendYield;
  }
  return {
    expenseRatio: round4(er),
    annualReturn: round4(ret),
    dividendYield: round4(yld),
    primaryTicker: holdings[0].ticker,
  };
}

/** Heuristic extraction from OCR / PDF text for calculator autofill. */
export function parseStatementText(text: string): ParseResult {
  const fields: DetectedFields = {};
  const matches: ParseResult["matches"] = [];
  const normalized = text.replace(/\u00a0/g, " ").replace(/\s+/g, " ");
  const lower = normalized.toLowerCase();

  const holdings = extractHoldings(normalized);
  if (holdings.length) {
    fields.holdings = holdings;
    const blend = blendHoldings(holdings);
    for (const h of holdings) {
      pushMatch(
        matches,
        "holding",
        `${h.ticker} ${h.weightPct}% (ER ${h.expenseRatio}%)`,
        `${h.ticker} allocation`,
      );
    }
    if (blend) {
      fields.ticker = blend.primaryTicker;
      fields.expenseRatio = blend.expenseRatio;
      fields.annualReturn = blend.annualReturn;
      fields.dividendYield = blend.dividendYield;
      pushMatch(
        matches,
        "blendedER",
        String(blend.expenseRatio),
        `Weighted ER across ${holdings.length} holdings`,
      );
      pushMatch(
        matches,
        "blendedReturn",
        String(blend.annualReturn),
        `Weighted planning return across ${holdings.length} holdings`,
      );
      pushMatch(
        matches,
        "blendedYield",
        String(blend.dividendYield),
        `Weighted yield across ${holdings.length} holdings`,
      );
    }
  }

  const tickers = [...INDEX_FUNDS.map((f) => f.ticker)].sort(
    (a, b) => b.length - a.length,
  );

  if (!fields.ticker) {
    for (const t of tickers) {
      const nearEr = new RegExp(
        `\\b${t}\\b[^\\d%]{0,24}(0?\\.\\d{1,4}|\\d\\.\\d{1,4})\\s*%`,
        "i",
      );
      const m = normalized.match(nearEr);
      if (m) {
        fields.ticker = t.toUpperCase();
        pushMatch(matches, "ticker", t.toUpperCase(), m[0]);
        const er = pctToNumber(m[1]);
        if (er !== undefined && er >= 0 && er <= 5) {
          fields.expenseRatio = er;
          pushMatch(matches, "expenseRatio", String(er), m[0]);
        }
        break;
      }
    }
  }

  if (!fields.ticker) {
    for (const t of tickers) {
      if (new RegExp(`\\b${t}\\b`, "i").test(normalized)) {
        fields.ticker = t.toUpperCase();
        pushMatch(matches, "ticker", t.toUpperCase(), `Found ticker ${t}`);
        break;
      }
    }
  }

  if (fields.ticker && !fields.holdings?.length) {
    const fund = getFund(fields.ticker);
    if (fund) {
      if (fields.expenseRatio === undefined) {
        fields.expenseRatio = fund.expenseRatio;
        pushMatch(
          matches,
          "expenseRatio",
          String(fund.expenseRatio),
          `Catalog ER for ${fund.ticker}`,
        );
      }
      if (fields.annualReturn === undefined) {
        fields.annualReturn = fund.expectedReturn;
        pushMatch(
          matches,
          "annualReturn",
          String(fund.expectedReturn),
          `Catalog planning return for ${fund.ticker}`,
        );
      }
      if (fields.dividendYield === undefined) {
        fields.dividendYield = fund.dividendYield;
        pushMatch(
          matches,
          "dividendYield",
          String(fund.dividendYield),
          `Catalog yield for ${fund.ticker}`,
        );
      }
    }
  }

  const labeledMoney: { key: keyof DetectedFields; patterns: RegExp[] }[] = [
    {
      key: "initial",
      patterns: [
        /(?:initial(?:\s+investment)?|starting\s+balance|current\s+balance|account\s+balance|portfolio\s+value|market\s+value|total\s+value|lump\s+sum|account\s+value)[:\s]*\$?([\d,]+(?:\.\d{2})?)/i,
        /(?:balance)[:\s]*\$?([\d,]{3,}(?:\.\d{2})?)/i,
      ],
    },
    {
      key: "contribution",
      patterns: [
        /(?:monthly\s+contribution|recurring(?:\s+contribution)?|auto(?:matic)?\s+invest(?:ment)?|contribution(?:\s+amount)?|deposit(?:\s+amount)?|per\s+month|payroll\s+deferral|employee\s+contribution)[:\s]*\$?([\d,]+(?:\.\d{2})?)/i,
        /\$([\d,]+(?:\.\d{2})?)\s*(?:per\s+month|\/mo|monthly)/i,
        /(?:contribute|contribution|deferral)\s*(?:of|=|:)?\s*\$?([\d,]+(?:\.\d{2})?)/i,
      ],
    },
  ];

  for (const { key, patterns } of labeledMoney) {
    if ((fields as Record<string, unknown>)[key] !== undefined) continue;
    for (const re of patterns) {
      const m = normalized.match(re);
      if (!m) continue;
      const n = moneyToNumber(m[1]);
      if (n === undefined) continue;
      if (key === "initial" && n < 10) continue;
      if (key === "contribution" && (n < 1 || n > 100000)) continue;
      (fields as Record<string, number>)[key] = Math.round(n);
      pushMatch(matches, key, String(Math.round(n)), m[0]);
      break;
    }
  }

  if (fields.expenseRatio === undefined) {
    const er =
      normalized.match(
        /(?:expense\s*ratio|net\s*expense|gross\s*expense|\bER\b)[:\s]*([\d.]+)\s*%/i,
      ) || normalized.match(/\b(0\.0\d{1,3})\s*%/);
    if (er) {
      const n = pctToNumber(er[1]);
      if (n !== undefined && n >= 0 && n <= 5) {
        fields.expenseRatio = n;
        pushMatch(matches, "expenseRatio", String(n), er[0]);
      }
    }
  }

  if (fields.annualReturn === undefined) {
    const ret = normalized.match(
      /(?:expected\s+(?:annual\s+)?return|annual(?:ized)?\s+return|avg(?:erage)?\s+return|cagr|target\s+return|assumed\s+return)[:\s]*([\d.]+)\s*%/i,
    );
    if (ret) {
      const n = pctToNumber(ret[1]);
      if (n !== undefined && n > 0 && n <= 40) {
        fields.annualReturn = n;
        pushMatch(matches, "annualReturn", String(n), ret[0]);
      }
    }
  }

  if (fields.dividendYield === undefined) {
    const div = normalized.match(
      /(?:dividend\s+yield|ttm\s+yield|yield\s*\(ttm\)|sec\s+yield)[:\s]*([\d.]+)\s*%/i,
    );
    if (div) {
      const n = pctToNumber(div[1]);
      if (n !== undefined && n >= 0 && n <= 15) {
        fields.dividendYield = n;
        pushMatch(matches, "dividendYield", String(n), div[0]);
      }
    }
  }

  const infl = normalized.match(/inflation[:\s]*([\d.]+)\s*%/i);
  if (infl) {
    const n = pctToNumber(infl[1]);
    if (n !== undefined && n >= 0 && n <= 20) {
      fields.inflation = n;
      pushMatch(matches, "inflation", String(n), infl[0]);
    }
  }

  const years =
    normalized.match(
      /(?:investment\s+)?(?:horizon|period|term)[:\s]*(\d{1,2})\s*(?:years?|yrs?)/i,
    ) ||
    normalized.match(/(\d{1,2})\s*(?:years?|yrs?)\s*(?:horizon|period|invest)/i);
  if (years && fields.years === undefined) {
    const n = Number(years[1]);
    if (n >= 5 && n <= 60) {
      fields.years = n;
      pushMatch(matches, "years", String(n), years[0]);
    }
  }

  if (/bi[\s-]?weekly/i.test(normalized)) {
    fields.frequency = "biweekly";
    pushMatch(matches, "frequency", "biweekly", "bi-weekly");
  } else if (/\bweekly\b/i.test(normalized) && !/bi[\s-]?weekly/i.test(normalized)) {
    fields.frequency = "weekly";
    pushMatch(matches, "frequency", "weekly", "weekly");
  } else if (/quarterly/i.test(normalized)) {
    fields.frequency = "quarterly";
    pushMatch(matches, "frequency", "quarterly", "quarterly");
  } else if (/\bannually\b|\byearly\b|per\s+year/i.test(normalized)) {
    fields.frequency = "annually";
    pushMatch(matches, "frequency", "annually", "annually");
  } else if (/monthly|payroll/i.test(normalized)) {
    fields.frequency = "monthly";
    pushMatch(matches, "frequency", "monthly", "monthly/payroll");
  }

  if (/\bdrip\b|reinvest(?:s|ed|ing)?\s+dividends|dividend\s+reinvestment/i.test(lower)) {
    fields.drip = true;
    pushMatch(matches, "drip", "true", "dividend reinvestment");
  }

  const step = normalized.match(
    /(?:step[\s-]?up|contribution\s+increase|salary\s+increase)[:\s]*([\d.]+)\s*%/i,
  );
  if (step) {
    const n = pctToNumber(step[1]);
    if (n !== undefined && n >= 0 && n <= 20) {
      fields.stepUp = n;
      pushMatch(matches, "stepUp", String(n), step[0]);
    }
  }

  if (fields.initial === undefined) {
    const amounts = [...normalized.matchAll(/\$\s*([\d,]+(?:\.\d{2})?)/g)]
      .map((m) => moneyToNumber(m[1]))
      .filter((n): n is number => n !== undefined && n >= 100);
    if (amounts.length) {
      const max = Math.max(...amounts);
      fields.initial = Math.round(max);
      pushMatch(matches, "initial", String(fields.initial), "Largest $-amount fallback");
    }
  }

  return { fields, matches };
}
