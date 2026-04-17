import { Router, type IRouter } from "express";
import { ilike, eq } from "drizzle-orm";
import { db, flightsTable } from "@workspace/db";
import {
  SearchFlightsQueryParams,
  SearchFlightsResponse,
  ListFlightsResponse,
  GetFlightParams,
  GetFlightResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

// ── City name → IATA code lookup ──────────────────────────────────────────
const CITY_TO_IATA: Record<string, string> = {
  delhi: "DEL", "new delhi": "DEL",
  mumbai: "BOM", bombay: "BOM",
  bangalore: "BLR", bengaluru: "BLR",
  chennai: "MAA", madras: "MAA",
  kolkata: "CCU", calcutta: "CCU",
  hyderabad: "HYD",
  goa: "GOI",
  kochi: "COK", cochin: "COK",
  jaipur: "JAI",
  pune: "PNQ",
  ahmedabad: "AMD",
  lucknow: "LKO",
  varanasi: "VNS",
  amritsar: "ATQ",
  nagpur: "NAG",
  indore: "IDR",
  bhopal: "BHO",
  srinagar: "SXR",
  leh: "IXL",
  patna: "PAT",
  ranchi: "IXR",
  bhubaneswar: "BBI",
  visakhapatnam: "VTZ", vizag: "VTZ",
  dubai: "DXB",
  singapore: "SIN",
  bangkok: "BKK",
  london: "LHR",
  "new york": "JFK",
  "abu dhabi": "AUH",
  "kuala lumpur": "KUL",
  colombo: "CMB",
  kathmandu: "KTM",
  coimbatore: "CJB",
  tiruchirappalli: "TRZ", trichy: "TRZ",
  madurai: "IXM",
  mangalore: "IXE",
  vadodara: "BDQ",
  surat: "STV",
  chandigarh: "IXC",
  vijayawada: "VGA",
  rajkot: "RAJ",
  jodhpur: "JDH",
  raipur: "RPR",
  dehradun: "DED",
  udaipur: "UDR",
  agra: "AGR",
  hubli: "HBX",
  jammu: "IXJ",
  dibrugarh: "DIB",
  bagdogra: "IXB",
  port_blair: "IXZ", "port blair": "IXZ",
  tirupati: "TIR",
  aurangabad: "IXU",
};

const CANONICAL: Record<string, string> = {
  DEL: "Delhi", BOM: "Mumbai", BLR: "Bangalore", MAA: "Chennai",
  CCU: "Kolkata", HYD: "Hyderabad", GOI: "Goa", COK: "Kochi",
  JAI: "Jaipur", PNQ: "Pune", AMD: "Ahmedabad", LKO: "Lucknow",
  VNS: "Varanasi", ATQ: "Amritsar", NAG: "Nagpur", IDR: "Indore",
  BHO: "Bhopal", SXR: "Srinagar", IXL: "Leh", PAT: "Patna",
  IXR: "Ranchi", BBI: "Bhubaneswar", VTZ: "Visakhapatnam",
  CJB: "Coimbatore", TRZ: "Tiruchirappalli", IXM: "Madurai",
  IXE: "Mangalore", BDQ: "Vadodara", STV: "Surat", IXC: "Chandigarh",
  VGA: "Vijayawada", RAJ: "Rajkot", JDH: "Jodhpur", RPR: "Raipur",
  DED: "Dehradun", UDR: "Udaipur", AGR: "Agra", HBX: "Hubli",
  IXJ: "Jammu", DIB: "Dibrugarh", IXB: "Bagdogra",
  IXZ: "Port Blair", TIR: "Tirupati", IXU: "Aurangabad",
  DXB: "Dubai", SIN: "Singapore", BKK: "Bangkok",
  LHR: "London", JFK: "New York", AUH: "Abu Dhabi",
  KUL: "Kuala Lumpur", CMB: "Colombo", KTM: "Kathmandu",
};

const KNOWN_IATA_CODES = new Set(Object.values(CITY_TO_IATA));

function resolveIata(raw: string): string | undefined {
  const clean = raw.trim();
  if (!clean) return undefined;

  const codeMatch = clean.match(/\(([A-Z]{3})\)\s*(?:-.*)?$/);
  if (codeMatch && KNOWN_IATA_CODES.has(codeMatch[1])) return codeMatch[1];

  if (/^[A-Z]{3}$/.test(clean) && KNOWN_IATA_CODES.has(clean)) return clean;

  const cityOnly = clean.replace(/\s*\(.*\)\s*$/, "").toLowerCase().trim();
  if (CITY_TO_IATA[cityOnly]) return CITY_TO_IATA[cityOnly];

  if (CITY_TO_IATA[clean.toLowerCase()]) return CITY_TO_IATA[clean.toLowerCase()];

  for (const word of clean.toLowerCase().split(/[\s,;()\-/]+/)) {
    if (word.length >= 3 && CITY_TO_IATA[word]) return CITY_TO_IATA[word];
  }

  return undefined;
}

// ── TripJack flight mapper ─────────────────────────────────────────────────
function mapTripJackFlight(item: any, idx: number, fromIata: string, toIata: string): any {
  const firstSeg = item.sI?.[0];
  const lastSeg  = item.sI?.[item.sI.length - 1];

  const airlineCode = firstSeg?.fD?.aI?.code || "";
  const airline     = firstSeg?.fD?.aI?.name || "Unknown Airline";
  const flightNum   = firstSeg?.fD?.fn
    ? `${airlineCode}${firstSeg.fD.fn}`
    : `FL${idx + 1}`;

  const depIso = firstSeg?.dt;
  const arrIso = lastSeg?.at;

  const depTime = depIso ? new Date(depIso).toTimeString().slice(0, 5) : "N/A";
  const arrTime = arrIso ? new Date(arrIso).toTimeString().slice(0, 5) : "N/A";

  const depMs  = depIso ? new Date(depIso).getTime() : 0;
  const arrMs  = arrIso ? new Date(arrIso).getTime() : 0;
  const diffMs = arrMs - depMs;
  const durH   = diffMs > 0 ? Math.floor(diffMs / 3_600_000) : 0;
  const durM   = diffMs > 0 ? Math.floor((diffMs % 3_600_000) / 60_000) : 0;
  const duration = diffMs > 0 ? `${durH}h ${durM.toString().padStart(2, "0")}m` : "N/A";

  const priceInfo = item.totalPriceList?.[0]?.fd?.ADULT;
  const price     = priceInfo?.fC?.TF || priceInfo?.fC?.BF || 0;
  const cabinClass = (priceInfo?.cc || "ECONOMY") === "BUSINESS" ? "Business" : "Economy";
  const seatsLeft  = priceInfo?.sR ?? 9;

  const stops = Math.max(0, (item.sI?.length || 1) - 1);

  return {
    id: idx + 1,
    airline,
    airlineCode,
    flightNumber: flightNum,
    origin:      CANONICAL[fromIata] || fromIata,
    destination: CANONICAL[toIata]   || toIata,
    departureTime: depTime,
    arrivalTime:   arrTime,
    duration,
    price,
    class: cabinClass,
    seatsAvailable: seatsLeft,
    stops,
    status: "scheduled",
  };
}

// ── Sample flights builder — used when TripJack returns 0 or errors ────────
function buildSampleFlights(fromIata: string, toIata: string) {
  const SAMPLES = [
    { name: "IndiGo",    code: "6E", num: "301", dep: "06:00", arr: "08:15", price: 3499 },
    { name: "Air India", code: "AI", num: "504", dep: "10:30", arr: "12:50", price: 4799 },
    { name: "Vistara",   code: "UK", num: "440", dep: "15:45", arr: "18:05", price: 5299 },
  ];
  const origin = CANONICAL[fromIata] || fromIata;
  const dest   = CANONICAL[toIata]   || toIata;

  return SAMPLES.map((a, idx) => {
    const [dh, dm] = a.dep.split(":").map(Number);
    const [ah, am] = a.arr.split(":").map(Number);
    const durMins  = (ah * 60 + am) - (dh * 60 + dm);
    return {
      id: idx + 1,
      airline: a.name,
      airlineCode: a.code,
      flightNumber: `${a.code}-${a.num}`,
      origin,
      destination: dest,
      departureTime: a.dep,
      arrivalTime:   a.arr,
      duration: `${Math.floor(durMins / 60)}h ${(durMins % 60).toString().padStart(2, "0")}m`,
      price: a.price,
      class: "Economy",
      seatsAvailable: 9,
      stops: 0,
      status: "scheduled",
    };
  });
}

const SAMPLE_FALLBACK_MSG = "Live flight data is limited in test mode. Showing sample results.";

// ── POST /api/flights — TripJack live search ───────────────────────────────
router.post("/flights", async (req, res): Promise<void> => {
  const {
    from,
    to,
    date,
    passengers = 1,
    class: requestedClass = "ECONOMY",
  } = req.body as {
    from?: string;
    to?: string;
    date?: string;
    passengers?: number;
    class?: string;
  };

  const fromIata = resolveIata(from || "");
  const toIata   = resolveIata(to   || "");

  if (!fromIata || !toIata) {
    res.status(400).json({
      error: `Could not find airport for "${!fromIata ? from : to}". Please use a valid city or IATA code.`,
    });
    return;
  }

  const tripJackKey = process.env.TRIPJACK_API_KEY;
  if (!tripJackKey) {
    res.status(503).json({ error: "TripJack API key not configured (TRIPJACK_API_KEY)." });
    return;
  }

  const travelDate = date || new Date().toISOString().slice(0, 10);
  const adultCount = Math.max(1, Number(passengers) || 1);
  const cabinClass = String(requestedClass).toUpperCase() === "BUSINESS" ? "BUSINESS" : "ECONOMY";

  const tripJackBody = {
    searchQuery: {
      cabinClass,
      paxInfo: { ADULT: adultCount, CHILD: 0, INFANT: 0 },
      routeInfos: [{ fromCityOrAirport: { code: fromIata }, toCityOrAirport: { code: toIata }, travelDate }],
      searchModifiers: { isDirectFlight: false, isConnectingFlight: false },
    },
  };

  try {
    const apiRes = await fetch("https://apitest.tripjack.com/fms/v1/air-search-all", {
      method: "POST",
      headers: { apikey: tripJackKey, "Content-Type": "application/json" },
      body: JSON.stringify(tripJackBody),
      signal: AbortSignal.timeout(20_000),
    });

    const data: any = await apiRes.json().catch(() => ({}));

    if (apiRes.ok && !data?.errors?.length) {
      const onward: any[] = data?.tripInfos?.ONWARD || [];
      const flights = onward.map((item, idx) => mapTripJackFlight(item, idx, fromIata, toIata));
      console.log(`[flights/tripjack] ${fromIata}→${toIata} on ${travelDate}: ${flights.length} flights`);

      if (flights.length > 0) {
        res.json({ flights, total: flights.length, source: "tripjack" });
        return;
      }
    } else {
      const reason = data?.errors?.[0]?.message || `HTTP ${apiRes.status}`;
      console.warn(`[flights/tripjack] API unavailable: ${reason} — serving sample flights`);
    }
  } catch (err: any) {
    console.warn(`[flights/tripjack] Request failed: ${err?.message} — serving sample flights`);
  }

  // TripJack returned 0 results or an error — serve sample cards
  const sampleFlights = buildSampleFlights(fromIata, toIata);
  res.json({
    flights: sampleFlights,
    total: sampleFlights.length,
    source: "scheduled",
    fallbackMessage: SAMPLE_FALLBACK_MSG,
  });
});

// ── GET /api/airports/search — airport autocomplete ────────────────────────
router.get("/airports/search", async (req, res): Promise<void> => {
  const q = ((req.query.q as string | undefined) || "").trim();
  if (!q || q.length < 2) {
    res.json({ airports: [] });
    return;
  }

  const rapidApiKey = process.env.RAPIDAPI_KEY;

  if (rapidApiKey) {
    try {
      const apiRes = await fetch(
        `https://booking-com15.p.rapidapi.com/api/v1/flights/searchDestination?query=${encodeURIComponent(q)}`,
        {
          headers: {
            "X-RapidAPI-Key": rapidApiKey,
            "X-RapidAPI-Host": "booking-com15.p.rapidapi.com",
          },
          signal: AbortSignal.timeout(6_000),
        }
      );
      if (apiRes.ok) {
        const body: any = await apiRes.json();
        const items: any[] = Array.isArray(body?.data) ? body.data : [];
        const airports = items.slice(0, 8).map((item: any) => ({
          id:      item.id || item.code,
          name:    item.name || item.cityName,
          iata:    item.code,
          city:    item.cityName || item.name,
          country: item.countryName || "",
          type:    item.type || "AIRPORT",
        }));
        res.json({ airports, source: "rapidapi" });
        return;
      }
    } catch (err: any) {
      console.warn(`[airports/search] RapidAPI error: ${err?.message}`);
    }
  }

  const lower = q.toLowerCase();
  const matches = Object.entries(CITY_TO_IATA)
    .filter(([city]) => city.includes(lower))
    .slice(0, 8)
    .map(([city, iata]) => ({
      id: iata, name: CANONICAL[iata] || city, iata, city: CANONICAL[iata] || city, country: "India", type: "AIRPORT",
    }));
  res.json({ airports: matches, source: "local" });
});

// ── GET /api/flights/search — DB search ───────────────────────────────────
router.get("/flights/search", async (req, res): Promise<void> => {
  const parsed = SearchFlightsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { origin, destination, class: flightClass } = parsed.data;

  let query = db.select().from(flightsTable).$dynamic();

  const conditions = [];
  if (origin)      conditions.push(ilike(flightsTable.origin,      `%${origin}%`));
  if (destination) conditions.push(ilike(flightsTable.destination, `%${destination}%`));
  if (flightClass) conditions.push(eq(flightsTable.class, flightClass));

  if (conditions.length > 0) {
    const { and } = await import("drizzle-orm");
    query = query.where(and(...conditions));
  }

  const flights = await query;
  const mapped = flights.map((f) => ({ ...f, price: Number(f.price), airlineLogoUrl: f.airlineLogoUrl ?? undefined }));
  res.json(SearchFlightsResponse.parse(mapped));
});

// ── GET /api/flights — list all DB flights ─────────────────────────────────
router.get("/flights", async (_req, res): Promise<void> => {
  const flights = await db.select().from(flightsTable).orderBy(flightsTable.id);
  const mapped = flights.map((f) => ({ ...f, price: Number(f.price), airlineLogoUrl: f.airlineLogoUrl ?? undefined }));
  res.json(ListFlightsResponse.parse(mapped));
});

// ── GET /api/flights/:id ───────────────────────────────────────────────────
router.get("/flights/:id", async (req, res): Promise<void> => {
  const params = GetFlightParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [flight] = await db.select().from(flightsTable).where(eq(flightsTable.id, params.data.id));
  if (!flight) {
    res.status(404).json({ error: "Flight not found" });
    return;
  }

  res.json(GetFlightResponse.parse({ ...flight, price: Number(flight.price), airlineLogoUrl: flight.airlineLogoUrl ?? undefined }));
});

export default router;
