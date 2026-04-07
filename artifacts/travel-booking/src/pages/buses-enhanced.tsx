import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { Link, useLocation } from "wouter";
import { useBusesWithFallback } from "@/lib/use-data-with-fallback";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Bus, 
  Search, 
  ArrowRight, 
  Filter, 
  IndianRupee,
  MapPin,
  Calendar,
  Users,
  SlidersHorizontal,
  Wind,
  Wifi,
  Coffee,
  Music,
  Zap
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function Buses() {
  const { data: buses, isLoading } = useBusesWithFallback();
  const [location] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [selectedOperators, setSelectedOperators] = useState<string[]>([]);
  const [selectedBusTypes, setSelectedBusTypes] = useState<string[]>([]);
  
  // MakeMyTrip-style: Don't show results until user searches
  const [hasSearched, setHasSearched] = useState(false);
  
  // Get admin markup
  const markup = parseFloat(localStorage.getItem("markup") || "0");
  
  // Reset filters when navigating to this page
  useEffect(() => {
    if (location === "/buses") {
      setSearchTerm("");
      setPriceRange([0, 5000]);
      setSelectedOperators([]);
      setSelectedBusTypes([]);
      setHasSearched(false); // Reset search state on navigation
    }
  }, [location]);

  // Get unique operators
  const operators = Array.isArray(buses) 
    ? Array.from(new Set(buses.map(b => b.operator)))
    : [];

  // Get unique bus types
  const busTypes = Array.isArray(buses)
    ? Array.from(new Set(buses.map(b => b.busType)))
    : [];

  const filteredBuses = Array.isArray(buses) ? buses.filter((bus) => {
    const matchesSearch = 
      bus.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bus.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bus.operator.toLowerCase().includes(searchTerm.toLowerCase());
    
    const finalPrice = bus.price + markup;
    const matchesPrice = finalPrice >= priceRange[0] && finalPrice <= priceRange[1];
    
    const matchesOperator = selectedOperators.length === 0 || 
      selectedOperators.includes(bus.operator);
    
    const matchesBusType = selectedBusTypes.length === 0 ||
      selectedBusTypes.includes(bus.busType);
    
    return matchesSearch && matchesPrice && matchesOperator && matchesBusType;
  }) : [];

  const toggleOperator = (operator: string) => {
    setSelectedOperators(prev =>
      prev.includes(operator)
        ? prev.filter(o => o !== operator)
        : [...prev, operator]
    );
  };

  const toggleBusType = (busType: string) => {
    setSelectedBusTypes(prev =>
      prev.includes(busType)
        ? prev.filter(t => t !== busType)
        : [...prev, busType]
    );
  };

  const clearAllFilters = () => {
    setSelectedOperators([]);
    setSelectedBusTypes([]);
    setPriceRange([0, 5000]);
    setSearchTerm("");
  };

  const getAmenityIcon = (amenity: string) => {
    const a = amenity.toLowerCase();
    if (a.includes('ac') || a.includes('air')) return <Wind className="w-3 h-3" />;
    if (a.includes('wifi') || a.includes('internet')) return <Wifi className="w-3 h-3" />;
    if (a.includes('water') || a.includes('snack') || a.includes('food')) return <Coffee className="w-3 h-3" />;
    if (a.includes('entertainment') || a.includes('tv')) return <Music className="w-3 h-3" />;
    if (a.includes('power') || a.includes('charging') || a.includes('usb')) return <Zap className="w-3 h-3" />;
    return null;
  };

  return (
    <Layout>
      {/* Hero Search Section */}
      <div className="bg-gradient-to-br from-orange-600 via-red-600 to-pink-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-3">Search Buses</h1>
            <p className="text-orange-100 mb-8">Book bus tickets online with the best offers</p>
            
            {/* Search Card */}
            <Card className="shadow-2xl border-0">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* From */}
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2">FROM</Label>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <Input 
                        placeholder="Bangalore"
                        className="border-0 p-0 h-8 font-semibold focus-visible:ring-0"
                      />
                    </div>
                  </div>

                  {/* To */}
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2">TO</Label>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <Input 
                        placeholder="Goa"
                        className="border-0 p-0 h-8 font-semibold focus-visible:ring-0"
                      />
                    </div>
                  </div>

                  {/* Date */}
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2">TRAVEL DATE</Label>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <Input 
                        type="date"
                        className="border-0 p-0 h-8 font-semibold focus-visible:ring-0"
                      />
                    </div>
                  </div>

                  {/* Passengers */}
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2">PASSENGERS</Label>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <select className="border-0 p-0 h-8 font-semibold bg-transparent focus:outline-none">
                        <option>1 Passenger</option>
                                        </div>

                <Button 
                  size="lg" 
                  className="w-full mt-6 bg-orange-600 hover:bg-orange-700 text-white font-bold h-12"
                  onClick={() => setHasSearched(true)}
                >
                  <Search className="w-5 h-5 mr-2" />
                  SEARCH BUSES
                </Button>
              </CardContent>
            </Card>Search className="w-5 h-5 mr-2" />
                  SEARCH BUSES
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
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
                  {(selectedOperators.length > 0 || selectedBusTypes.length > 0 || priceRange[0] > 0 || priceRange[1] < 5000) && (
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
                      max={5000}
                      step={100}
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

                {/* Bus Operators Filter */}
                <div>
                  <h4 className="font-semibold mb-4 text-sm">Bus Operators</h4>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {operators.map((operator) => (
                      <div key={operator} className="flex items-center space-x-3">
                        <Checkbox
                          id={operator}
                          checked={selectedOperators.includes(operator)}
                          onCheckedChange={() => toggleOperator(operator)}
                        />
                        <label
                          htmlFor={operator}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                        >
                          {operator}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bus Type Filter */}
                <div>
                  <h4 className="font-semibold mb-4 text-sm">Bus Type</h4>
                  <div className="space-y-3">
                    {busTypes.map((busType) => (
                      <div key={busType} className="flex items-center space-x-3">
                        <Checkbox
                          id={busType}
                          checked={selectedBusTypes.includes(busType)}
                          onCheckedChange={() => toggleBusType(busType)}
                        />
                        <label
                          htmlFor={busType}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                        >
                          {busType}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Departure Time */}
                <div>
                  <h4 className="font-semibold mb-4 text-sm">Departure Time</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Morning", time: "6AM - 12PM", icon: "🌅" },
                      { label: "Afternoon", time: "12PM - 6PM", icon: "☀️" },
                      { label: "Evening", time: "6PM - 12AM", icon: "🌆" },
                      { label: "Night", time: "12AM - 6AM", icon: "🌙" }
                    ].map((slot) => (
                      <Button
                        key={slot.label}
                        variant="outline"
                        size="sm"
                        className="flex flex-col h-auto py-2 text-xs"
                      >
                        <span className="text-lg mb-1">{slot.icon}</span>
                        <span className="font-semibold">{slot.label}</span>
                        <span className="text-[10px] text-muted-foreground">{slot.time}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Mobile Filter Button */}
          <div className="lg:hidden">
            <But          {/* Buses List */}
          <main className="flex-1 space-y-4">
            {!hasSearched ? (
              // Initial Empty State - User hasn't searched yet
              <Card className="border-2 border-dashed">
                <CardContent className="py-24 text-center">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-orange-100 flex items-center justify-center">
                    <Bus className="w-12 h-12 text-orange-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Find Your Perfect Bus</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Enter your journey details above and click "SEARCH BUSES" to see available options
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Search className="w-4 h-4" />
                    <span>Search to get started</span>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold">
                  {filteredBuses?.length || 0} Buses Available
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Choose from our wide range of buses
                </p>
              </div>
              <select className="border rounded-lg px-4 py-2 text-sm font-medium bg-background">
                <option>Cheapest First</option>
                <option>Fastest First</option>
                <option>Earliest Departure</option>
                <option>Latest Departure</option>
              </select>
            </div>

            {/* Loading State */}to get started</span>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold">
                  {filteredBuses?.length || 0} Buses Available
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Choose from our wide range of buses
                </p>
              </div>
              <select className="border rounded-lg px-4 py-2 text-sm font-medium bg-background">
                <option>Cheapest First</option>
                <option>Fastest First</option>
                <option>Earliest Departure</option>
                <option>Latest Departure</option>
              </select>
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
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredBuses?.length === 0 ? (
              // Empty State
              <Card>
                <CardContent className="py-16 text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <Bus className="w-10 h-10 text-muted-foreground opacity-50" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">No buses found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your filters or search criteria
                  </p>
                  <Button onClick={clearAllFilters} variant="outline">
                    Clear All Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              // Bus Cards
              <div className="space-y-4">
                {filteredBuses.map((bus) => {
                  const finalPrice = bus.price + markup;
                  
                  return (
                    <Card
                      key={bus.id}
                      className="overflow-hidden hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20"
                    >
                      <CardContent className="p-0">
                        <div className="flex flex-col lg:flex-row">
                          {/* Bus Info */}
                          <div className="flex-1 p-6">
                            {/* Operator */}
                            <div className="flex items-center gap-3 mb-6">
                              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center shadow-md">
                                <Bus className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <p className="font-bold text-lg">{bus.operator}</p>
                                <p className="text-xs text-muted-foreground">{bus.busNumber}</p>
                              </div>
                              <Badge variant="secondary" className="ml-auto">
                                {bus.busType}
                              </Badge>
                            </div>

                            {/* Route & Time */}
                            <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-4 mb-4">
                              {/* Origin */}
                              <div>
                                <p className="text-2xl font-bold">{bus.departureTime}</p>
                                <p className="text-sm font-semibold text-muted-foreground">{bus.origin}</p>
                              </div>

                              {/* Duration */}
                              <div className="flex flex-col items-center px-4">
                                <p className="text-xs text-muted-foreground mb-1">{bus.duration}</p>
                                <div className="flex items-center gap-2">
                                  <div className="h-[2px] w-16 bg-gradient-to-r from-muted to-muted" />
                                  <Bus className="w-4 h-4 text-primary" />
                                  <div className="h-[2px] w-16 bg-gradient-to-r from-muted to-muted" />
                                </div>
                              </div>

                              {/* Destination */}
                              <div className="text-right">
                                <p className="text-2xl font-bold">{bus.arrivalTime}</p>
                                <p className="text-sm font-semibold text-muted-foreground">{bus.destination}</p>
                              </div>
                            </div>

                            {/* Amenities */}
                            {bus.amenities && bus.amenities.length > 0 && (
                              <div className="flex flex-wrap gap-2 pt-4 border-t">
                                {bus.amenities.slice(0, 5).map((amenity, i) => (
                                  <Badge key={i} variant="outline" className="text-xs flex items-center gap-1">
                                    {getAmenityIcon(amenity)}
                                    {amenity}
                                  </Badge>
                                ))}
                                    })}
              </div>
            )}
            </>
            )}
          </main>
        </div>
      </div>
    </Layout>
  );
}                         {/* Price & CTA */}
                          <div className="lg:w-56 bg-muted/30 p-6 flex flex-col justify-between border-t lg:border-t-0 lg:border-l">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Starting from</p>
                              <div className="flex items-center gap-1 mb-1">
                                <IndianRupee className="w-5 h-5 text-primary" />
                                <p className="text-3xl font-bold text-primary">
                                  {finalPrice.toLocaleString()}
                                </p>
                              </div>
                              <p className="text-xs text-muted-foreground">per seat</p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {bus.seatsAvailable} seats available
                              </p>
                            </div>

                            <div className="space-y-2 mt-4">
                              <Link href={`/buses/${bus.id}`}>
                                <Button className="w-full bg-orange-600 hover:bg-orange-700 font-bold">
                                  Select Seats
                                </Button>
                              </Link>
                              <Link href={`/buses/${bus.id}`}>
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
              </div>
            )}
          </main>
        </div>
      </div>
    </Layout>
  );
}
