export type AirportEntry = {
  IATA: string;
  ICAO?: string;
  "Airport name": string;
  Country: string;
  City: string;
};

export type AirportSuggestion = {
  name: string;
  airportName: string;
  code: string;
  country: string;
};

/**
 * Overrides for airports where the dataset's City field contains a local area
 * or suburb name rather than the well-known major city name users would search.
 * IATA code → correct user-friendly city name.
 */
const CITY_NAME_OVERRIDES: Record<string, string> = {
  // Local area / suburb → Major city
  RJA: "Rajahmundry",   // Madhurapudi → Rajahmundry
  VGA: "Vijayawada",    // Gannavaram → Vijayawada
  GOI: "Goa",           // Vasco da Gama → Goa
  GOX: "Goa (Mopa)",    // Mopa → Goa (North / Mopa)
  SLV: "Shimla",        // Jubbarhatti → Shimla
  KUU: "Kullu",         // Bhuntar → Kullu (Manali area)
  SAG: "Shirdi",        // Kakadi → Shirdi
  HGI: "Itanagar",      // Hollongi → Itanagar
  KJB: "Kurnool",       // Orvakal → Kurnool
  TCR: "Thoothukudi",   // Vagaikulam → Thoothukudi (Tuticorin)
  VDY: "Hospet",        // Toranagallu → Hospet (Vijayanagara)
  IXB: "Bagdogra",      // Siliguri → Bagdogra (airport is known by this name)

  // Strip extraneous area info in parentheses
  DED: "Dehradun",      // Dehradun (Jauligrant)
  AJL: "Aizawl",        // Aizawl (Lengpui)
  KQH: "Ajmer",         // Ajmer (Kishangarh)
  PNY: "Puducherry",    // Puducherry (Pondicherry)

  // Officially renamed cities
  DEL: "Delhi",         // New Delhi → Delhi
  IXD: "Prayagraj",     // Allahabad → Prayagraj
  IXG: "Belagavi",      // Belgaum → Belagavi
  CCJ: "Kozhikode",     // Calicut → Kozhikode
  AYJ: "Ayodhya",       // Faizabad → Ayodhya
};

let _cache: AirportEntry[] | null = null;
let _loadPromise: Promise<AirportEntry[]> | null = null;

export function loadAirports(): Promise<AirportEntry[]> {
  if (_cache) return Promise.resolve(_cache);
  if (!_loadPromise) {
    _loadPromise = fetch("/airports.json")
      .then((r) => r.json())
      .then((data: AirportEntry[]) => {
        _cache = data;
        return data;
      });
  }
  return _loadPromise;
}

export function searchAirports(
  airports: AirportEntry[],
  query: string,
  limit = 10
): AirportSuggestion[] {
  const q = query.toLowerCase().trim();
  if (q.length < 1) return [];

  type Scored = { suggestion: AirportSuggestion; score: number };
  const scored: Scored[] = [];

  for (const a of airports) {
    const originalCity = a.City || "";
    const displayCity  = CITY_NAME_OVERRIDES[a.IATA] ?? originalCity;
    const name         = a["Airport name"] || "";
    const iata         = a.IATA || "";

    const dLow  = displayCity.toLowerCase();
    const oLow  = originalCity.toLowerCase();
    const nLow  = name.toLowerCase();
    const iLow  = iata.toLowerCase();

    // Score: higher = better match (shown first)
    let score = 0;
    if (dLow === q)              score = 100; // exact city match (highest)
    else if (iLow === q)         score = 90;  // exact IATA match
    else if (dLow.startsWith(q)) score = 80;  // city starts with query
    else if (oLow.startsWith(q)) score = 70;  // original city starts with
    else if (nLow.startsWith(q)) score = 60;  // airport name starts with
    else if (dLow.includes(q))   score = 50;  // city contains
    else if (oLow.includes(q))   score = 40;  // original city contains
    else if (nLow.includes(q))   score = 30;  // airport name contains
    else if (iLow.includes(q))   score = 20;  // IATA contains

    if (score > 0) {
      scored.push({
        score,
        suggestion: {
          name: displayCity || name,
          airportName: name,
          code: iata,
          country: a.Country,
        },
      });
    }
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.suggestion);
}
