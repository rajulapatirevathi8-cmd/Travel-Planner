import { useQuery } from "@tanstack/react-query";

export interface LiveFlight {
  id: number;
  airline: string;
  airlineCode?: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  class: string;
  seatsAvailable: number;
  stops?: number;
  status?: string;
}

interface LiveSearchResult {
  flights: LiveFlight[];
  total: number;
  source: "tripjack";
  error?: string;
}

async function fetchLiveFlights(from: string, to: string, date: string): Promise<LiveSearchResult> {
  const res = await fetch("/api/flights", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, date }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error || `Server error ${res.status}`);
  }

  return res.json() as Promise<LiveSearchResult>;
}

export function useFlightSearch(from: string, to: string, date: string) {
  const enabled = Boolean(from.trim() && to.trim());

  const query = useQuery<LiveSearchResult, Error>({
    queryKey: ["flights-live-search", from, to, date],
    queryFn: () => fetchLiveFlights(from, to, date),
    enabled,
    retry: 1,
    staleTime: 2 * 60 * 1000,
  });

  return {
    flights: query.data?.flights ?? [],
    isLoading: query.isLoading,
    isLiveError: query.isError,
    isNoResults: !query.isLoading && !query.isError && (query.data?.flights.length ?? 0) === 0,
    usingFallback: false,
    errorMessage: query.error?.message,
    source: query.data?.source ?? null,
    fallbackMessage: undefined,
    refetch: query.refetch,
  };
}
