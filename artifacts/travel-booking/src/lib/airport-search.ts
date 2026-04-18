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

  const results: AirportSuggestion[] = [];

  for (const a of airports) {
    if (results.length >= limit) break;
    const city = a.City || "";
    const name = a["Airport name"] || "";
    const iata = a.IATA || "";

    if (
      city.toLowerCase().includes(q) ||
      name.toLowerCase().includes(q) ||
      iata.toLowerCase().includes(q)
    ) {
      results.push({
        name: city || name,
        airportName: name,
        code: iata,
        country: a.Country,
      });
    }
  }

  return results;
}
