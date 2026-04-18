import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AutocompleteInput } from "@/components/autocomplete-input";
import { citySuggestions, busCitySuggestions, hotelCitySuggestions, packageDestinations } from "@/lib/city-suggestions";
import { loadAirports, searchAirports, type AirportEntry, type AirportSuggestion } from "@/lib/airport-search";
import { Plane, Bus, Building2, Map, Search, ArrowLeftRight } from "lucide-react";

interface SearchTabsProps {
  defaultTab?: "flights" | "hotels" | "buses" | "packages";
  onTabChange?: (tab: string) => void;
  initialFrom?: string;
  initialTo?: string;
  initialDate?: string;
}

export function SearchTabs({
  defaultTab = "flights",
  onTabChange,
  initialFrom = "",
  initialTo = "",
  initialDate = "",
}: SearchTabsProps) {
  const [, setLocation] = useLocation();

  const today    = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().split("T")[0];

  const [flightFrom, setFlightFrom] = useState(initialFrom);
  const [flightTo,   setFlightTo]   = useState(initialTo);
  const [flightDate, setFlightDate] = useState(initialDate || today);

  const [airportData,      setAirportData]      = useState<AirportEntry[]>([]);
  const [fromSuggestions,  setFromSuggestions]  = useState<AirportSuggestion[]>([]);
  const [toSuggestions,    setToSuggestions]    = useState<AirportSuggestion[]>([]);
  const fromDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toDebounceRef   = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadAirports().then(setAirportData);
  }, []);

  useEffect(() => {
    if (fromDebounceRef.current) clearTimeout(fromDebounceRef.current);
    fromDebounceRef.current = setTimeout(() => {
      setFromSuggestions(airportData.length ? searchAirports(airportData, flightFrom) : []);
    }, 300);
    return () => { if (fromDebounceRef.current) clearTimeout(fromDebounceRef.current); };
  }, [flightFrom, airportData]);

  useEffect(() => {
    if (toDebounceRef.current) clearTimeout(toDebounceRef.current);
    toDebounceRef.current = setTimeout(() => {
      setToSuggestions(airportData.length ? searchAirports(airportData, flightTo) : []);
    }, 300);
    return () => { if (toDebounceRef.current) clearTimeout(toDebounceRef.current); };
  }, [flightTo, airportData]);

  const [hotelLocation,   setHotelLocation]   = useState("");
  const [hotelSearchCity, setHotelSearchCity] = useState(""); // actual city for search (may differ if hotel brand selected)
  const [hotelCheckIn,    setHotelCheckIn]    = useState(today);
  const [hotelCheckOut,   setHotelCheckOut]   = useState(tomorrow);

  const [busFrom, setBusFrom] = useState("");
  const [busTo,   setBusTo]   = useState("");
  const [busDate, setBusDate] = useState(today);

  const [packageDestination, setPackageDestination] = useState("");

  const [flightError, setFlightError] = useState(false);
  const [hotelError,  setHotelError]  = useState(false);
  const [busError,    setBusError]    = useState(false);

  const handleFlightSearch = (e: React.MouseEvent) => {
    if (!flightFrom.trim() || !flightTo.trim() || !flightDate.trim()) {
      e.preventDefault();
      setFlightError(true);
      setTimeout(() => setFlightError(false), 3000);
    }
  };

  const handleHotelSearch = (e: React.MouseEvent) => {
    if (!hotelLocation.trim() || !hotelCheckIn.trim() || !hotelCheckOut.trim()) {
      e.preventDefault();
      setHotelError(true);
      setTimeout(() => setHotelError(false), 3000);
    }
  };

  // When user selects a hotel suggestion: code = city to search (for hotel brands)
  const handleHotelLocationChange = (value: string, code?: string) => {
    setHotelLocation(value);
    // If code is provided (hotel brand selected), use it as the search city; otherwise use typed value
    setHotelSearchCity(code || value);
  };

  const handleBusSearch = (e: React.MouseEvent) => {
    if (!busFrom.trim() || !busTo.trim() || !busDate.trim()) {
      e.preventDefault();
      setBusError(true);
      setTimeout(() => setBusError(false), 3000);
    }
  };

  const handleBusSwap = () => { const t = busFrom; setBusFrom(busTo); setBusTo(t); };
  const handleFlightSwap = () => { const t = flightFrom; setFlightFrom(flightTo); setFlightTo(t); };

  const flightsUrl = (flightFrom.trim() && flightTo.trim() && flightDate.trim())
    ? `/flights/results?from=${encodeURIComponent(flightFrom)}&to=${encodeURIComponent(flightTo)}&date=${encodeURIComponent(flightDate)}&travelers=1`
    : "#";

  // Use hotelSearchCity (the actual city) for search — differs when hotel brand is selected
  const hotelCityForSearch = hotelSearchCity.trim() || hotelLocation.trim();
  const hotelsUrl = (hotelCityForSearch && hotelCheckIn.trim() && hotelCheckOut.trim())
    ? `/hotels/results?city=${encodeURIComponent(hotelCityForSearch)}&checkin=${encodeURIComponent(hotelCheckIn)}&checkout=${encodeURIComponent(hotelCheckOut)}&guests=1`
    : "#";

  const busesUrl = (busFrom.trim() && busTo.trim() && busDate.trim())
    ? `/bus/results?from=${encodeURIComponent(busFrom)}&to=${encodeURIComponent(busTo)}&date=${encodeURIComponent(busDate)}`
    : "#";

  const inputCls = "flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";
  const labelCls = "text-xs font-semibold text-muted-foreground uppercase tracking-wider";

  return (
    <Card className="w-full max-w-4xl shadow-2xl border-0 bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/85">
      <CardContent className="p-2 sm:p-4">
        <Tabs defaultValue={defaultTab} className="w-full" onValueChange={onTabChange}>
          <TabsList className="grid w-full grid-cols-4 h-14 bg-gray-100/80 rounded-lg p-1">
            <TabsTrigger value="flights" className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary text-sm sm:text-base font-semibold">
              <Plane className="w-4 h-4 mr-2 hidden sm:inline-block" /> Flights
            </TabsTrigger>
            <TabsTrigger value="hotels" className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary text-sm sm:text-base font-semibold">
              <Building2 className="w-4 h-4 mr-2 hidden sm:inline-block" /> Hotels
            </TabsTrigger>
            <TabsTrigger value="buses" className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary text-sm sm:text-base font-semibold">
              <Bus className="w-4 h-4 mr-2 hidden sm:inline-block" /> Buses
            </TabsTrigger>
            <TabsTrigger value="packages" className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary text-sm sm:text-base font-semibold">
              <Map className="w-4 h-4 mr-2 hidden sm:inline-block" /> Packages
            </TabsTrigger>
          </TabsList>

          {/* ── Flights ── */}
          <TabsContent value="flights" className="pt-6 pb-2 px-2">
            <div className="flex flex-col lg:grid lg:grid-cols-4 gap-4">
              {/* FROM + swap + TO — vertical on mobile, row on desktop */}
              <div className="lg:col-span-2 flex flex-col sm:flex-row sm:items-end gap-1.5 sm:gap-2">
                <div className="flex-1 min-w-0 space-y-1">
                  <label className={labelCls}>From</label>
                  <AutocompleteInput placeholder="City or Airport" suggestions={fromSuggestions} value={flightFrom} onChange={setFlightFrom} maxSuggestions={10} />
                </div>
                <button onClick={handleFlightSwap}
                  className="w-9 h-9 rounded-full border border-gray-200 bg-white text-gray-400 hover:text-gray-600 hover:scale-105 active:scale-95 transition-all duration-150 flex items-center justify-center shadow-sm shrink-0 self-center sm:self-auto sm:mb-0.5 my-0 sm:my-0"
                  title="Swap cities">
                  <ArrowLeftRight className="w-4 h-4" />
                </button>
                <div className="flex-1 min-w-0 space-y-1">
                  <label className={labelCls}>To</label>
                  <AutocompleteInput placeholder="City or Airport" suggestions={toSuggestions} value={flightTo} onChange={setFlightTo} maxSuggestions={10} />
                </div>
              </div>
              <div className="space-y-1">
                <label className={labelCls}>Date</label>
                <input type="date" value={flightDate} min={today} onChange={(e) => setFlightDate(e.target.value)} className={inputCls} />
              </div>
              <div className="space-y-1">
                <label className={labelCls + " invisible hidden sm:block"}>Search</label>
                <Button asChild size="lg" className="w-full h-12 text-base font-bold">
                  <Link href={flightsUrl} onClick={handleFlightSearch}>
                    <Search className="w-5 h-5 mr-2" /> Search Flights
                  </Link>
                </Button>
                {flightError && <p className="text-red-600 text-xs mt-2 font-medium">⚠️ Please fill all fields</p>}
              </div>
            </div>
          </TabsContent>

          {/* ── Hotels ── */}
          <TabsContent value="hotels" className="pt-6 pb-2 px-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className={labelCls}>Location or Hotel</label>
                <AutocompleteInput placeholder="City or hotel name (e.g. Mumbai, Taj)" suggestions={hotelCitySuggestions} value={hotelLocation} onChange={handleHotelLocationChange} />
              </div>
              <div className="space-y-1">
                <label className={labelCls}>Check-in</label>
                <input type="date" value={hotelCheckIn} min={today} onChange={(e) => setHotelCheckIn(e.target.value)} className={inputCls} />
              </div>
              <div className="space-y-1">
                <label className={labelCls}>Check-out</label>
                <input type="date" value={hotelCheckOut} min={hotelCheckIn || today} onChange={(e) => setHotelCheckOut(e.target.value)} className={inputCls} />
              </div>
              <div className="flex items-end">
                <div className="w-full space-y-1">
                  <label className={labelCls + " invisible"}>Search</label>
                  <Button asChild size="lg" className="w-full h-12 text-base font-bold">
                    <Link href={hotelsUrl} onClick={handleHotelSearch}>
                      <Search className="w-5 h-5 mr-2" /> Search Hotels
                    </Link>
                  </Button>
                  {hotelError && <p className="text-red-600 text-xs mt-2 font-medium">⚠️ Please fill all fields</p>}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ── Buses ── */}
          <TabsContent value="buses" className="pt-6 pb-2 px-2">
            <div className="flex flex-col lg:grid lg:grid-cols-4 gap-4">
              {/* FROM + swap + TO — vertical on mobile, row on desktop */}
              <div className="lg:col-span-2 flex flex-col sm:flex-row sm:items-end gap-1.5 sm:gap-2">
                <div className="flex-1 min-w-0 space-y-1">
                  <label className={labelCls}>Leaving From</label>
                  <AutocompleteInput placeholder="e.g. Hyderabad" suggestions={busCitySuggestions} value={busFrom} onChange={setBusFrom} />
                </div>
                <button onClick={handleBusSwap}
                  className="w-9 h-9 rounded-full border border-gray-200 bg-white text-gray-400 hover:text-gray-600 hover:scale-105 active:scale-95 transition-all duration-150 flex items-center justify-center shadow-sm shrink-0 self-center sm:self-auto sm:mb-0.5 my-0 sm:my-0"
                  title="Swap cities">
                  <ArrowLeftRight className="w-4 h-4" />
                </button>
                <div className="flex-1 min-w-0 space-y-1">
                  <label className={labelCls}>Going To</label>
                  <AutocompleteInput placeholder="e.g. Bangalore" suggestions={busCitySuggestions} value={busTo} onChange={setBusTo} />
                </div>
              </div>
              <div className="space-y-1">
                <label className={labelCls}>Date</label>
                <input type="date" value={busDate} min={today} onChange={(e) => setBusDate(e.target.value)} className={inputCls} />
              </div>
              <div className="space-y-1">
                <label className={labelCls + " invisible hidden sm:block"}>Search</label>
                <Button asChild size="lg" className="w-full h-12 text-base font-bold">
                  <Link href={busesUrl} onClick={handleBusSearch}>
                    <Search className="w-5 h-5 mr-2" /> Search Buses
                  </Link>
                </Button>
                {busError && <p className="text-red-600 text-xs mt-2 font-medium">⚠️ Please fill all fields</p>}
              </div>
            </div>
          </TabsContent>

          {/* ── Packages ── */}
          <TabsContent value="packages" className="pt-6 pb-2 px-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="sm:col-span-2 space-y-1">
                <label className={labelCls}>Destination</label>
                <AutocompleteInput placeholder="Where do you want to go?" suggestions={packageDestinations} value={packageDestination} onChange={setPackageDestination} />
              </div>
              <div className="space-y-1">
                <label className={labelCls}>Package Type</label>
                <select className={inputCls}>
                  <option value="">Any Type</option>
                  <option value="beach">Beach</option>
                  <option value="adventure">Adventure</option>
                  <option value="cultural">Cultural</option>
                </select>
              </div>
              <div className="flex items-end">
                <div className="w-full space-y-1">
                  <label className={labelCls + " invisible"}>Search</label>
                  <Button asChild size="lg" className="w-full h-12 text-base font-bold">
                    <Link href={packageDestination ? `/packages?destination=${encodeURIComponent(packageDestination)}` : "/packages"}>
                      <Search className="w-5 h-5 mr-2" /> Find Packages
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
