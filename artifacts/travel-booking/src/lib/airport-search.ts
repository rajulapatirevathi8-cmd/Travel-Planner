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

const INDIA_MAX = 4;
const INTL_MAX  = 2;

function scoreMatch(
  displayCity: string,
  originalCity: string,
  airportName: string,
  iata: string,
  q: string
): number {
  const dLow = displayCity.toLowerCase();
  const oLow = originalCity.toLowerCase();
  const nLow = airportName.toLowerCase();
  const iLow = iata.toLowerCase();

  if (dLow === q)              return 100; // exact city match
  if (iLow === q)              return 90;  // exact IATA match
  if (dLow.startsWith(q))     return 80;  // city starts with
  if (oLow.startsWith(q))     return 70;  // original city starts with
  if (nLow.startsWith(q))     return 60;  // airport name starts with
  if (dLow.includes(q))       return 50;  // city contains
  if (oLow.includes(q))       return 40;  // original city contains
  if (nLow.includes(q))       return 30;  // airport name contains
  if (iLow.includes(q))       return 20;  // IATA contains
  return 0;
}

export function searchAirports(
  airports: AirportEntry[],
  query: string
): AirportSuggestion[] {
  const q = query.toLowerCase().trim();
  if (q.length < 1) return [];

  type Scored = { suggestion: AirportSuggestion; score: number };
  const india: Scored[] = [];
  const intl:  Scored[] = [];

  for (const a of airports) {
    const originalCity = a.City || "";
    const displayCity  = CITY_NAME_OVERRIDES[a.IATA] ?? originalCity;
    const name         = a["Airport name"] || "";
    const iata         = a.IATA || "";

    const score = scoreMatch(displayCity, originalCity, name, iata, q);
    if (score === 0) continue;

    const entry: Scored = {
      score,
      suggestion: {
        name: displayCity || name,
        airportName: name,
        code: iata,
        country: a.Country,
      },
    };

    if (a.Country === "India") {
      india.push(entry);
    } else {
      intl.push(entry);
    }
  }

  const sortDesc = (a: Scored, b: Scored) => b.score - a.score;

  const topIndia = india.sort(sortDesc).slice(0, INDIA_MAX).map((s) => s.suggestion);
  const topIntl  = intl.sort(sortDesc).slice(0, INTL_MAX).map((s) => s.suggestion);

  return [...topIndia, ...topIntl];
}
