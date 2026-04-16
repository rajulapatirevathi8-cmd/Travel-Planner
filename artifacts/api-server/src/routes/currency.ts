import { Router, type IRouter } from "express";

const router: IRouter = Router();

let cachedRates: Record<string, number> | null = null;
let cacheExpiry = 0;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

const BASE_RATES_INR: Record<string, number> = {
  USD: 83.5, EUR: 90.2, GBP: 105.8, AED: 22.7,
  SGD: 61.8, AUD: 54.3, CAD: 61.2, JPY: 0.55,
  THB: 2.32, MYR: 17.8, LKR: 0.26, NPR: 0.63,
  CNY: 11.5, CHF: 93.1, HKD: 10.7, QAR: 22.9,
  SAR: 22.2, KWD: 272.0, BHD: 221.5, OMR: 217.0,
};

// GET /api/currency/rates?base=INR
router.get("/currency/rates", async (_req, res): Promise<void> => {
  const now = Date.now();
  if (cachedRates && now < cacheExpiry) {
    res.json({ rates: cachedRates, source: "cache", updatedAt: new Date(cacheExpiry - CACHE_TTL_MS).toISOString() });
    return;
  }

  try {
    const apiRes = await fetch("https://open.er-api.com/v6/latest/INR", {
      signal: AbortSignal.timeout(5_000),
    });

    if (apiRes.ok) {
      const body: any = await apiRes.json();
      if (body?.rates) {
        const inv = body.rates;
        // Invert: we want X per 1 INR → store as INR per 1 X
        const inrPer: Record<string, number> = {};
        for (const [cur, rateFromInr] of Object.entries(inv) as [string, number][]) {
          if (rateFromInr > 0) inrPer[cur] = parseFloat((1 / rateFromInr).toFixed(4));
        }
        cachedRates = inrPer;
        cacheExpiry = now + CACHE_TTL_MS;
        res.json({ rates: inrPer, source: "live", updatedAt: new Date().toISOString() });
        return;
      }
    }
  } catch {
    // fall through to static
  }

  res.json({ rates: BASE_RATES_INR, source: "static", updatedAt: new Date().toISOString() });
});

// GET /api/currency/convert?amount=5000&from=INR&to=USD
router.get("/currency/convert", (req, res): void => {
  const amount = parseFloat((req.query.amount as string) || "0");
  const from   = ((req.query.from as string) || "INR").toUpperCase();
  const to     = ((req.query.to   as string) || "USD").toUpperCase();

  if (!amount || isNaN(amount)) {
    res.status(400).json({ error: "Valid amount required" });
    return;
  }

  const rates = cachedRates || BASE_RATES_INR;

  let amountInInr = amount;
  if (from !== "INR") {
    const rateFromToInr = rates[from];
    if (!rateFromToInr) { res.status(400).json({ error: `Unknown currency: ${from}` }); return; }
    amountInInr = amount * rateFromToInr;
  }

  let result = amountInInr;
  if (to !== "INR") {
    const rateToFromInr = rates[to];
    if (!rateToFromInr) { res.status(400).json({ error: `Unknown currency: ${to}` }); return; }
    result = amountInInr / rateToFromInr;
  }

  res.json({ amount, from, to, result: parseFloat(result.toFixed(2)), rate: parseFloat((result / amount).toFixed(6)) });
});

export default router;
