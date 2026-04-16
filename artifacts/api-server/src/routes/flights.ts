import { Router, type IRouter } from "express";
import { ilike, or, eq } from "drizzle-orm";
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

const IATA_TO_CITY: Record<string, string> = Object.fromEntries(
  Object.entries(CITY_TO_IATA).map(([city, iata]) => [iata, city])
);

// Canonical city names for display
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

// Parse "HH:MM" from ISO 8601 with timezone (keeps local time)
function parseIsoTime(iso: string | null | undefined): string {
  if (!iso) return "N/A";
  const m = iso.match(/T(\d{2}):(\d{2})/);
  return m ? `${m[1]}:${m[2]}` : "N/A";
}

// Calculate duration string from two ISO strings
function calcDuration(dep: string | null | undefined, arr: string | null | undefined): string {
  if (!dep || !arr) return "N/A";
  const depMs = new Date(dep).getTime();
  const arrMs = new Date(arr).getTime();
  const diff = arrMs - depMs;
  if (diff <= 0) return "N/A";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `${h}h ${m.toString().padStart(2, "0")}m`;
}

// Generate a realistic INR price
function dummyPrice(fromIata: string, toIata: string): number {
  const seed = (fromIata.charCodeAt(0) + toIata.charCodeAt(0)) * 37;
  const base = 2500 + (seed % 6000);
  return Math.round(base / 100) * 100;
}

// ── Synthetic schedule builder — used when live API returns 0 results ──────
const SCHEDULE_AIRLINES = [
  { name: "IndiGo",    prefix: "6E", nums: ["301", "505", "610", "701", "820"] },
  { name: "Air India", prefix: "AI", nums: ["202", "504", "670", "780", "915"] },
  { name: "Vistara",   prefix: "UK", nums: ["312", "440", "566", "680", "722"] },
  { name: "SpiceJet",  prefix: "SG", nums: ["220", "301", "412", "530", "614"] },
  { name: "Akasa Air", prefix: "QP", nums: ["1101", "1203", "1304", "1405"] },
  { name: "GoAir",     prefix: "G8", nums: ["115", "214", "320", "412"] },
];

function buildSyntheticFlights(
  from: string, to: string, fromIata: string, toIata: string
): any[] {
  // Deterministic seed so same route always gives same schedule
  const seed = fromIata.charCodeAt(0) * 31 + toIata.charCodeAt(0) * 17;
  const baseHours = 1 + (seed % 3);             // 1 h, 2 h or 3 h flight
  const baseMins  = (seed * 7) % 55;            // 0–54 extra minutes
  const totalDurMins = baseHours * 60 + baseMins;

  // Six departure slots spread across the day
  const depSlots = ["05:45", "08:30", "11:00", "14:00", "17:30", "20:15"];

  return SCHEDULE_AIRLINES.slice(0, 6).map((airline, idx) => {
    const [dh, dm] = depSlots[idx].split(":").map(Number);
    const arrTotal = dh * 60 + dm + totalDurMins;
    const ah = Math.floor((arrTotal % 1440) / 60);
    const am = arrTotal % 60;
    const arrTime = `${ah.toString().padStart(2, "0")}:${am.toString().padStart(2, "0")}`;
    const durStr  = `${baseHours}h ${baseMins.toString().padStart(2, "0")}m`;

    return {
      id: idx + 1,
      airline: airline.name,
      flightNumber: `${airline.prefix}-${airline.nums[idx % airline.nums.length]}`,
      origin: CANONICAL[fromIata] || from,
      destination: CANONICAL[toIata] || to,
      departureTime: depSlots[idx],
      arrivalTime: arrTime,
      duration: durStr,
      price: dummyPrice(fromIata, toIata) + idx * 250,
      class: idx === 2 ? "Business" : "Economy",
      seatsAvailable: 8 + (idx * 9) % 50,
      stops: 0,
      status: "scheduled",
    };
  });
}

// ── Single route fetch helper ───────────────────────────────────────────────
async function fetchFromAviationstack(
  apiKey: string, depIata: string, arrIata: string, date: string
): Promise<any[]> {
  const params: Record<string, string> = {
    access_key: apiKey,
    dep_iata: depIata,
    arr_iata: arrIata,
    limit: "20",
  };
  if (date) params.flight_date = date;

  // Free plan is HTTP-only
  const url = `http://api.aviationstack.com/v1/flights?${new URLSearchParams(params)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  const body: any = await res.json();

  if (body?.error) {
    throw new Error(body.error?.info || body.error?.message || "Aviationstack error");
  }
  return Array.isArray(body?.data) ? body.data : [];
}

function mapRawFlight(
  f: any, idx: number, fromIata: string, toIata: string, from: string, to: string
) {
  const depScheduled = f.departure?.scheduled || f.departure?.estimated;
  const arrScheduled = f.arrival?.scheduled   || f.arrival?.estimated;
  return {
    id: idx + 1,
    airline: f.airline?.name || "Unknown Airline",
    flightNumber: f.flight?.iata || `FL${idx + 1}`,
    origin: CANONICAL[fromIata] || from,
    destination: CANONICAL[toIata] || to,
    departureTime: parseIsoTime(depScheduled),
    arrivalTime: parseIsoTime(arrScheduled),
    duration: calcDuration(depScheduled, arrScheduled),
    price: dummyPrice(fromIata, toIata) + idx * 150,
    class: "Economy",
    seatsAvailable: 5 + (idx % 45),
    stops: 0,
    status: f.flight_status || "scheduled",
  };
}

// ── Booking.com (RapidAPI) flight search ───────────────────────────────────
async function fetchFromBookingCom(
  rapidApiKey: string,
  fromIata: string,
  toIata: string,
  date: string,
  from: string,
  to: string,
): Promise<any[] | null> {
  const departDate = date || new Date().toISOString().slice(0, 10);
  const url = `https://booking-com15.p.rapidapi.com/api/v1/flights/searchFlights?fromId=${fromIata}.AIRPORT&toId=${toIata}.AIRPORT&departDate=${departDate}&pageNo=1&adults=1&children=0%2C17&sort=BEST&cabinClass=ECONOMY&currency_code=INR`;

  const res = await fetch(url, {
    headers: {
      "X-RapidAPI-Key": rapidApiKey,
      "X-RapidAPI-Host": "booking-com15.p.rapidapi.com",
    },
    signal: AbortSignal.timeout(12_000),
  });

  if (!res.ok) return null;
  const body: any = await res.json();
  if (!body?.status || !Array.isArray(body?.data?.flightOffers)) return null;

  const offers: any[] = body.data.flightOffers.slice(0, 8);
  const mapped = offers.map((offer, idx) => {
    const seg   = offer.segments?.[0];
    const leg   = seg?.legs?.[0];
    const carrier = leg?.carriersData?.[0];
    const depTime = leg?.departureTime ? leg.departureTime.replace("T", " ").slice(11, 16) : "N/A";
    const arrTime = leg?.arrivalTime   ? leg.arrivalTime.replace("T", " ").slice(11, 16)   : "N/A";

    const depMs = leg?.departureTime ? new Date(leg.departureTime).getTime() : 0;
    const arrMs = leg?.arrivalTime   ? new Date(leg.arrivalTime).getTime()   : 0;
    const diffMs = arrMs - depMs;
    const durH = diffMs > 0 ? Math.floor(diffMs / 3_600_000) : 0;
    const durM = diffMs > 0 ? Math.floor((diffMs % 3_600_000) / 60_000) : 0;
    const duration = diffMs > 0 ? `${durH}h ${durM.toString().padStart(2, "0")}m` : "N/A";

    const totalUnits = offer.priceBreakdown?.total?.units ?? 0;
    const totalNanos = offer.priceBreakdown?.total?.nanos  ?? 0;
    const price = totalUnits > 0
      ? Math.round(totalUnits + totalNanos / 1_000_000_000)
      : dummyPrice(fromIata, toIata) + idx * 300;

    const flightNum = leg?.flightInfo?.flightNumber
      ? `${carrier?.code || ""}${leg.flightInfo.flightNumber}`
      : `XX${idx + 1}`;

    return {
      id: idx + 1,
      airline: carrier?.name || "Unknown Airline",
      airlineCode: carrier?.code,
      flightNumber: flightNum,
      origin: CANONICAL[fromIata] || from,
      destination: CANONICAL[toIata] || to,
      departureTime: depTime,
      arrivalTime: arrTime,
      duration,
      price,
      class: leg?.cabinClass === "BUSINESS" ? "Business" : "Economy",
      seatsAvailable: 5 + (idx * 7) % 40,
      status: "scheduled",
      stops: (offer.segments?.length ?? 1) - 1,
    };
  });

  return mapped.filter((f) => f.airline !== "Unknown Airline" || f.price > 0);
}

// ── Resolve IATA code from various input formats ───────────────────────────
// Handles: "BOM", "Mumbai", "Mumbai (BOM)", "Mumbai (BOM) - Chhatrapati..."
const KNOWN_IATA_CODES = new Set(Object.values(CITY_TO_IATA));

function resolveIata(raw: string): string | undefined {
  const clean = raw.trim();
  if (!clean) return undefined;

  // 1. Extract "(XYZ)" pattern — e.g. "Mumbai (BOM)" → "BOM"
  const codeMatch = clean.match(/\(([A-Z]{3})\)\s*(?:-.*)?$/);
  if (codeMatch && KNOWN_IATA_CODES.has(codeMatch[1])) return codeMatch[1];

  // 2. Direct 3-letter IATA code — e.g. "BOM"
  if (/^[A-Z]{3}$/.test(clean) && KNOWN_IATA_CODES.has(clean)) return clean;

  // 3. Strip parenthetical suffix and look up city name — e.g. "Mumbai (foo)" → "mumbai"
  const cityOnly = clean.replace(/\s*\(.*\)\s*$/, "").toLowerCase().trim();
  if (CITY_TO_IATA[cityOnly]) return CITY_TO_IATA[cityOnly];

  // 4. Try full lowercase string as city name
  if (CITY_TO_IATA[clean.toLowerCase()]) return CITY_TO_IATA[clean.toLowerCase()];

  // 5. Try each word in the input
  for (const word of clean.toLowerCase().split(/[\s,;()\-/]+/)) {
    if (word.length >= 3 && CITY_TO_IATA[word]) return CITY_TO_IATA[word];
  }

  return undefined;
}

// ── GET /api/flights/live-search ───────────────────────────────────────────
router.get("/flights/live-search", async (req, res): Promise<void> => {
  const from = (req.query.from as string | undefined) || "";
  const to   = (req.query.to   as string | undefined) || "";
  const date = (req.query.date as string | undefined) || "";

  const fromIata = resolveIata(from);
  const toIata   = resolveIata(to);

  if (!fromIata || !toIata) {
    res.status(400).json({
      error: `Could not find airport for "${!fromIata ? from : to}". Please select from the dropdown suggestions (e.g. Mumbai (BOM), Delhi (DEL)).`,
    });
    return;
  }

  const originName = CANONICAL[fromIata] || from;
  const destName   = CANONICAL[toIata]   || to;
  const rapidApiKey = process.env.RAPIDAPI_KEY;
  const aviationKey = process.env.AVIATIONSTACK_API_KEY;

  // ── 1. Try Booking.com (RapidAPI) first — best fare data ─────────────────
  if (rapidApiKey) {
    try {
      const bookingFlights = await fetchFromBookingCom(rapidApiKey, fromIata, toIata, date, from, to);
      if (bookingFlights && bookingFlights.length > 0) {
        console.log(`[live-search] Booking.com OK: ${bookingFlights.length} flights for ${fromIata}→${toIata}`);
        res.json({ flights: bookingFlights, total: bookingFlights.length, source: "booking.com" });
        return;
      }
    } catch (err: any) {
      console.warn(`[live-search] Booking.com error: ${err?.message}`);
    }
  }

  // ── 2. Fall back to Aviationstack ─────────────────────────────────────────
  if (aviationKey) {
    try {
      let raw = await fetchFromAviationstack(aviationKey, fromIata, toIata, date);

      if (raw.length > 0) {
        const flights = raw.map((f, i) => mapRawFlight(f, i, fromIata, toIata, from, to));
        res.json({ flights, total: flights.length, source: "aviationstack" });
        return;
      }

      const HUB_PAIRS: [string, string][] = [
        ["DEL", "BOM"], ["BOM", "BLR"], ["DEL", "BLR"], ["BOM", "MAA"],
      ];
      const hubPair = HUB_PAIRS.find(([d, a]) => d !== fromIata && a !== toIata) ?? HUB_PAIRS[0];
      let hubRaw: any[] = [];
      try { hubRaw = await fetchFromAviationstack(aviationKey, hubPair[0], hubPair[1], date); } catch { /* ok */ }

      const synthetic = buildSyntheticFlights(from, to, fromIata, toIata);
      if (hubRaw.length > 0) {
        const hubFlights = hubRaw.slice(0, 3).map((f, i) => mapRawFlight(f, i, fromIata, toIata, from, to));
        const blended = [...synthetic.slice(0, 3), ...hubFlights].map((f, i) => ({ ...f, id: i + 1 }));
        res.json({ flights: blended, total: blended.length, source: "scheduled", fallbackMessage: `No exact live flights for ${originName} → ${destName}. Showing typical scheduled flights.` });
      } else {
        res.json({ flights: synthetic, total: synthetic.length, source: "scheduled", fallbackMessage: `No live data for ${originName} → ${destName}. Showing typical scheduled flights.` });
      }
      return;
    } catch (err: any) {
      console.error("[live-search] Aviationstack error:", err?.message);
    }
  }

  // ── 3. Full synthetic fallback ────────────────────────────────────────────
  const synthetic = buildSyntheticFlights(from, to, fromIata, toIata);
  res.json({
    flights: synthetic,
    total: synthetic.length,
    source: "scheduled",
    fallbackMessage: `Showing typical scheduled flights for ${originName} → ${destName}.`,
  });
});

// ── GET /api/airports/search — city/airport autocomplete via RapidAPI ──────
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

  // Local fallback
  const lower = q.toLowerCase();
  const matches = Object.entries(CITY_TO_IATA)
    .filter(([city]) => city.includes(lower))
    .slice(0, 8)
    .map(([city, iata]) => ({
      id: iata, name: CANONICAL[iata] || city, iata, city: CANONICAL[iata] || city, country: "India", type: "AIRPORT",
    }));
  res.json({ airports: matches, source: "local" });
});

router.get("/flights/search", async (req, res): Promise<void> => {
  const parsed = SearchFlightsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { origin, destination, class: flightClass, passengers } = parsed.data;

  let query = db
    .select()
    .from(flightsTable)
    .$dynamic();

  const conditions = [];
  if (origin) {
    conditions.push(ilike(flightsTable.origin, `%${origin}%`));
  }
  if (destination) {
    conditions.push(ilike(flightsTable.destination, `%${destination}%`));
  }
  if (flightClass) {
    conditions.push(eq(flightsTable.class, flightClass));
  }

  if (conditions.length > 0) {
    const { and } = await import("drizzle-orm");
    query = query.where(and(...conditions));
  }

  const flights = await query;
  const mapped = flights.map((f) => ({
    ...f,
    price: Number(f.price),
    airlineLogoUrl: f.airlineLogoUrl ?? undefined,
  }));
  res.json(SearchFlightsResponse.parse(mapped));
});

router.get("/flights", async (_req, res): Promise<void> => {
  const flights = await db.select().from(flightsTable).orderBy(flightsTable.id);
  const mapped = flights.map((f) => ({
    ...f,
    price: Number(f.price),
    airlineLogoUrl: f.airlineLogoUrl ?? undefined,
  }));
  res.json(ListFlightsResponse.parse(mapped));
});

router.get("/flights/:id", async (req, res): Promise<void> => {
  const params = GetFlightParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [flight] = await db
    .select()
    .from(flightsTable)
    .where(eq(flightsTable.id, params.data.id));

  if (!flight) {
    res.status(404).json({ error: "Flight not found" });
    return;
  }

  res.json(GetFlightResponse.parse({ ...flight, price: Number(flight.price), airlineLogoUrl: flight.airlineLogoUrl ?? undefined }));
});

export default router;
