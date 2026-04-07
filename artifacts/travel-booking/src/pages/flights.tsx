import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { Link, useLocation } from "wouter";
import { useFlightsWithFallback } from "@/lib/use-data-with-fallback";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AutocompleteInput } from "@/components/autocomplete-input";
import { citySuggestions } from "@/lib/city-suggestions";
import { 
  Plane, 
  Search, 
  Clock, 
  ArrowRight, 
  Filter, 
  IndianRupee,
  MapPin,
  Calendar,
  Users,
  SlidersHorizontal,
  X
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function Flights() {
  const { data: flights, isLoading } = useFlightsWithFallback();
  const [location] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<"cheapest" | "fastest" | "earliest" | "latest">("cheapest");
  const [departureTime, setDepartureTime] = useState<string[]>([]);
  
  // Search form states
  const [flightFrom, setFlightFrom] = useState("");
  const [flightTo, setFlightTo] = useState("");
  const [flightDate, setFlightDate] = useState("");
    // Validation error state
  const [searchError, setSearchError] = useState(false);
  
  // MakeMyTrip-style: Don't show results until user searches
  const [hasSearched, setHasSearched] = useState(false);// Reset all filters when navigating to this page
  useEffect(() => {
    if (location === "/flights") {
      const urlParams = new URLSearchParams(window.location.search);
      const fromParam = urlParams.get('from');
      const toParam = urlParams.get('to');
      const hasValidParams = fromParam && fromParam.trim() !== '' && toParam && toParam.trim() !== '';
      
      setSearchTerm("");
      setPriceRange([0, 50000]);
      setSelectedAirlines([]);
      
      if (!hasValidParams) {
        setHasSearched(false);
        setFlightFrom("");
        setFlightTo("");
        setFlightDate("");
      } else {
        // User came from home page with search values
        setHasSearched(true);
        setFlightFrom(fromParam);
        setFlightTo(toParam);
      }
    }
  }, [location]);

  // Get admin markup
  const markup = parseFloat(localStorage.getItem("markup") || "0");
    // Get unique airlines
  const airlines = Array.isArray(flights) 
    ? Array.from(new Set(flights.map(f => f.airline)))
    : [];
  
  // Helper function to get time period from departure time
  const getTimePeriod = (time: string) => {
    const hour = parseInt(time.split(':')[0]);
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 24) return 'evening';
    return 'night'; // 12AM - 6AM
  };
  
  const filteredFlights = Array.isArray(flights) ? flights.filter((flight) => {
    const matchesSearch = 
      flight.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.airline.toLowerCase().includes(searchTerm.toLowerCase());
    
    const finalPrice = flight.price + markup;
    const matchesPrice = finalPrice >= priceRange[0] && finalPrice <= priceRange[1];
    
    const matchesAirline = selectedAirlines.length === 0 || 
      selectedAirlines.includes(flight.airline);
    
    const matchesDepartureTime = departureTime.length === 0 ||
      departureTime.includes(getTimePeriod(flight.departureTime));
    
    return matchesSearch && matchesPrice && matchesAirline && matchesDepartureTime;
  }) : [];
  // Sort flights based on selected option
  const sortedFlights = [...filteredFlights].sort((a, b) => {
    switch (sortBy) {
      case "cheapest":
        return (a.price + markup) - (b.price + markup);
      case "fastest":
        // Parse duration (e.g., "2h 30m" -> minutes)
        const getDurationMinutes = (duration: string | number) => {
          if (typeof duration === 'number') return duration;
          const match = duration.toString().match(/(\d+)h?\s*(\d+)?m?/);
          if (!match) return 0;
          const hours = parseInt(match[1] || "0");
          const minutes = parseInt(match[2] || "0");
          return hours * 60 + minutes;
        };
        return getDurationMinutes(a.duration) - getDurationMinutes(b.duration);
      case "earliest":
        // Parse time (e.g., "06:00" -> minutes from midnight)
        const getTimeMinutes = (time: string) => {
          const [hours, minutes] = time.split(':').map(Number);
          return hours * 60 + minutes;
        };
        return getTimeMinutes(a.departureTime) - getTimeMinutes(b.departureTime);
      case "latest":
        const getTimeMinutes2 = (time: string) => {
          const [hours, minutes] = time.split(':').map(Number);
          return hours * 60 + minutes;
        };
        return getTimeMinutes2(b.departureTime) - getTimeMinutes2(a.departureTime);
      default:
        return 0;
    }
  });

  const toggleAirline = (airline: string) => {
    setSelectedAirlines(prev =>
      prev.includes(airline)
        ? prev.filter(a => a !== airline)
        : [...prev, airline]
    );
  };  const clearAllFilters = () => {
    setSelectedAirlines([]);
    setPriceRange([0, 50000]);
    setSearchTerm("");
  };

  const handleSearch = () => {
    // Validate required fields
    if (!flightFrom.trim() || !flightTo.trim() || !flightDate.trim()) {
      setSearchError(true);
      setTimeout(() => setSearchError(false), 3000);
      return;
    }
    
    // All fields valid - proceed with search
    setSearchError(false);
    setHasSearched(true);
  };

  return (
    <Layout>
      {/* Hero Search Section */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-3">Search Flights</h1>
            <p className="text-blue-100 mb-8">Book cheap flight tickets at the lowest prices</p>
            
            {/* Search Card */}
            <Card className="shadow-2xl border-0">
              <CardContent className="p-6">                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* From */}
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2">FROM</Label>
                    <AutocompleteInput
                      placeholder="Delhi (DEL)"
                      suggestions={citySuggestions}
                      value={flightFrom}
                      onChange={setFlightFrom}
                      className="border-0 p-0 h-8 font-semibold focus-visible:ring-0"
                    />
                  </div>

                  {/* To */}
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2">TO</Label>
                    <AutocompleteInput
                      placeholder="Bangalore (BLR)"
                      suggestions={citySuggestions}
                      value={flightTo}
                      onChange={setFlightTo}
                      className="border-0 p-0 h-8 font-semibold focus-visible:ring-0"
                    />
                  </div>                  {/* Date */}
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2">DEPARTURE</Label>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <Input 
                        type="date"
                        value={flightDate}
                        onChange={(e) => setFlightDate(e.target.value)}
                        className="border-0 p-0 h-8 font-semibold focus-visible:ring-0"
                      />
                    </div>
                  </div>

                  {/* Passengers */}
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2">TRAVELERS</Label>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <select className="border-0 p-0 h-8 font-semibold bg-transparent focus:outline-none">
                        <option>1 Adult</option>
                        <option>2 Adults</option>
                        <option>3 Adults</option>
                      </select>
                    </div>
                  </div>
                </div>                <Button 
                  size="lg" 
                  className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold h-12"
                  onClick={handleSearch}
                >
                  <Search className="w-5 h-5 mr-2" />
                  SEARCH FLIGHTS
                </Button>
                
                {/* Error Message */}
                {searchError && (
                  <div className="mt-4">
                    <p className="text-red-600 text-sm font-medium flex items-center gap-2">
                      <span className="text-lg">⚠️</span>
                      Please fill in all required fields
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {!hasSearched ? (
          /* Empty State - Show before search */
          <Card className="max-w-2xl mx-auto">
            <CardContent className="py-16 text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center">
                <Plane className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Search for Flights</h3>
              <p className="text-muted-foreground mb-4">
                Enter your journey details above and click "Search Flights" to find the best deals
              </p>
            </CardContent>
          </Card>
        ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters - Desktop */}
          <aside className={cn(
            "lg:w-80 space-y-6",
            "hidden lg:block"
          )}>
            <Card className="sticky top-20">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5" />
                    Filters
                  </h3>
                  {(selectedAirlines.length > 0 || priceRange[0] > 0 || priceRange[1] < 50000) && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={clearAllFilters}
                      className="text-xs"
                    >
                      Clear All
                    </Button>
                  )}
                </div>

                {/* Price Range Filter */}
                <div>
                  <h4 className="font-semibold mb-4 text-sm">Price Range</h4>
                  <div className="space-y-4">
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      min={0}
                      max={50000}
                      step={500}
                      className="mb-2"
                    />
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center font-semibold">
                        <IndianRupee className="w-3 h-3" />
                        {priceRange[0].toLocaleString()}
                      </span>
                      <span className="text-muted-foreground">to</span>
                      <span className="flex items-center font-semibold">
                        <IndianRupee className="w-3 h-3" />
                        {priceRange[1].toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Airlines Filter */}
                <div>
                  <h4 className="font-semibold mb-4 text-sm">Airlines</h4>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {airlines.map((airline) => (
                      <div key={airline} className="flex items-center space-x-3">
                        <Checkbox
                          id={airline}
                          checked={selectedAirlines.includes(airline)}
                          onCheckedChange={() => toggleAirline(airline)}
                        />
                        <label
                          htmlFor={airline}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                        >
                          {airline}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>                {/* Departure Time */}
                <div>
                  <h4 className="font-semibold mb-4 text-sm">Departure Time</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: "morning", label: "Morning", time: "6AM - 12PM", icon: "🌅" },
                      { value: "afternoon", label: "Afternoon", time: "12PM - 6PM", icon: "☀️" },
                      { value: "evening", label: "Evening", time: "6PM - 12AM", icon: "🌆" },
                      { value: "night", label: "Night", time: "12AM - 6AM", icon: "🌙" }
                    ].map((slot) => (
                      <Button
                        key={slot.value}
                        variant={departureTime.includes(slot.value) ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          "flex flex-col h-auto py-3 text-xs",
                          departureTime.includes(slot.value) && "bg-primary text-primary-foreground"
                        )}
                        onClick={() => {
                          setDepartureTime(prev => 
                            prev.includes(slot.value) 
                              ? prev.filter(t => t !== slot.value)
                              : [...prev, slot.value]
                          );
                        }}
                      >
                        <span className="text-lg mb-1">{slot.icon}</span>
                        <span className="font-semibold">{slot.label}</span>
                        <span className="text-[10px] opacity-80">{slot.time}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>          {/* Mobile Filter Button */}
          <div className="lg:hidden">
            <Button 
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="w-full mb-4 gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters {(selectedAirlines.length > 0 || departureTime.length > 0 || priceRange[0] > 0 || priceRange[1] < 50000) && `(${selectedAirlines.length + departureTime.length + (priceRange[0] > 0 || priceRange[1] < 50000 ? 1 : 0)})`}
            </Button>
          </div>

          {/* Flights List */}
          <main className="flex-1 space-y-4">            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold">
                  {sortedFlights?.length || 0} Flights Available
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Showing best prices for your search
                </p>
              </div>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cheapest">Cheapest First</SelectItem>
                  <SelectItem value="fastest">Fastest First</SelectItem>
                  <SelectItem value="earliest">Earliest Departure</SelectItem>
                  <SelectItem value="latest">Latest Departure</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Loading State */}
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-1/4" />
                          <Skeleton className="h-6 w-1/2" />
                        </div>
                        <Skeleton className="h-10 w-28" />
                      </div>
                    </CardContent>                  </Card>
                ))}
              </div>
            ) : sortedFlights?.length === 0 ? (
              // Empty State
              <Card>
                <CardContent className="py-16 text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <Plane className="w-10 h-10 text-muted-foreground opacity-50" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">No flights found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your filters or search criteria
                  </p>
                  <Button onClick={clearAllFilters} variant="outline">
                    Clear All Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              // Flight Cards
              <div className="space-y-4">
                {sortedFlights.map((flight) => {
                  const finalPrice = flight.price + markup;
                  
                  return (
                    <Card
                      key={flight.id}
                      className="overflow-hidden hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20"
                    >
                      <CardContent className="p-0">
                        <div className="flex flex-col lg:flex-row">
                          {/* Flight Info */}
                          <div className="flex-1 p-6">
                            {/* Airline */}
                            <div className="flex items-center gap-3 mb-6">
                              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                                <span className="text-white font-bold text-sm">
                                  {flight.airline.substring(0, 2).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="font-bold text-lg">{flight.airline}</p>
                                <p className="text-xs text-muted-foreground">{flight.flightNumber}</p>
                              </div>
                              <Badge variant="secondary" className="ml-auto">
                                {flight.class}
                              </Badge>
                            </div>

                            {/* Route & Time */}
                            <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-4">
                              {/* Origin */}                              <div>
                                <p className="text-2xl font-bold">{flight.departureTime}</p>
                                <p className="text-sm font-semibold text-muted-foreground">{flight.origin}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date().toLocaleDateString('en-IN', {
                                    day: '2-digit',
                                    month: 'short'
                                  })}
                                </p>
                              </div>

                              {/* Duration */}
                              <div className="flex flex-col items-center px-4">
                                <p className="text-xs text-muted-foreground mb-1">{flight.duration}</p>
                                <div className="flex items-center gap-2">
                                  <div className="h-[2px] w-16 bg-gradient-to-r from-muted to-muted" />
                                  <Plane className="w-4 h-4 text-primary transform rotate-45" />
                                  <div className="h-[2px] w-16 bg-gradient-to-r from-muted to-muted" />
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Non-stop</p>
                              </div>

                              {/* Destination */}                              <div className="text-right">
                                <p className="text-2xl font-bold">{flight.arrivalTime}</p>
                                <p className="text-sm font-semibold text-muted-foreground">{flight.destination}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date().toLocaleDateString('en-IN', {
                                    day: '2-digit',
                                    month: 'short'
                                  })}
                                </p>
                              </div>
                            </div>

                            {/* Additional Info */}                            <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                              <Badge variant="outline" className="text-xs">
                                {flight.seatsAvailable || 0} seats left
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                Refundable
                              </Badge>
                            </div>
                          </div>

                          {/* Price & CTA */}
                          <div className="lg:w-56 bg-muted/30 p-6 flex flex-col justify-between border-t lg:border-t-0 lg:border-l">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Starting from</p>
                              <div className="flex items-center gap-1 mb-1">
                                <IndianRupee className="w-5 h-5 text-primary" />
                                <p className="text-3xl font-bold text-primary">
                                  {finalPrice.toLocaleString()}
                                </p>
                              </div>
                              <p className="text-xs text-muted-foreground">per adult</p>
                            </div>

                            <div className="space-y-2 mt-4">
                              <Link href={`/flights/${flight.id}`}>
                                <Button className="w-full bg-blue-600 hover:bg-blue-700 font-bold">
                                  Book Now
                                </Button>
                              </Link>
                              <Link href={`/flights/${flight.id}`}>
                                <Button variant="outline" className="w-full text-xs">
                                  View Details
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>            )}
          </main>
        </div>
        )}
      </div>
    </Layout>
  );
}
