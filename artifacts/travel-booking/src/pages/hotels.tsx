import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { Link, useLocation } from "wouter";
import { useHotelsWithFallback } from "@/lib/use-data-with-fallback";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { AutocompleteInput } from "@/components/autocomplete-input";
import { hotelCitySuggestions } from "@/lib/city-suggestions";
import { 
  Building2, 
  Search, 
  Filter, 
  Star, 
  MapPin, 
  Calendar, 
  Users, 
  SlidersHorizontal, 
  IndianRupee,
  ArrowRight,
  Wifi,
  Coffee,
  Dumbbell,
  Car
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function Hotels() {
  const { data: hotels, isLoading } = useHotelsWithFallback();
  const [location] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState([0, 20000]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  
  // Search form state
  const [hotelLocation, setHotelLocation] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  
  // Validation error state
  const [searchError, setSearchError] = useState(false);
  
  // MakeMyTrip-style: Don't show results until user searches
  // BUT if coming from home page with search params, show results immediately
  const [hasSearched, setHasSearched] = useState(false);
  
  // Get admin markup
  const markup = parseFloat(localStorage.getItem("markup") || "0");

  // Check if we have URL search parameters from home page
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const locationParam = urlParams.get('location');
    
    // Only show results if user actually entered search values
    if (locationParam && locationParam.trim() !== '') {
      // User came from home page with actual search value - show results immediately
      setHasSearched(true);
      setHotelLocation(locationParam);
      setSearchTerm(locationParam);
    }
  }, []);

  // Reset filters when navigating to this page
  useEffect(() => {
    if (location === "/hotels") {
      const urlParams = new URLSearchParams(window.location.search);
      const locationParam = urlParams.get('location');
      const hasValidParam = locationParam && locationParam.trim() !== '';
      
      setSearchTerm("");
      setPriceRange([0, 20000]);
      setSelectedRatings([]);
      
      if (!hasValidParam) {
        setHasSearched(false); // Only reset if no valid search param
        setHotelLocation("");
      }
    }
  }, [location]);

  const filteredHotels = Array.isArray(hotels) ? hotels.filter((hotel) => {
    const matchesSearch = 
      hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      hotel.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const finalPrice = hotel.pricePerNight + markup;
    const matchesPrice = finalPrice >= priceRange[0] && finalPrice <= priceRange[1];
    
    const matchesRating = selectedRatings.length === 0 || 
      selectedRatings.includes(hotel.stars);
    
    return matchesSearch && matchesPrice && matchesRating;
  }) : [];

  const toggleRating = (rating: number) => {
    setSelectedRatings(prev =>
      prev.includes(rating)
        ? prev.filter(r => r !== rating)
        : [...prev, rating]
    );
  };

  const clearAllFilters = () => {
    setSelectedRatings([]);
    setPriceRange([0, 20000]);
    setSearchTerm("");
  };

  const handleSearch = () => {
    // Validate required fields
    if (!hotelLocation.trim() || !checkInDate.trim() || !checkOutDate.trim()) {
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
      <div className="bg-gradient-to-br from-green-600 via-teal-600 to-blue-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-3">Find Your Perfect Stay</h1>
            <p className="text-green-100 mb-8">Book hotels with the best offers and instant confirmation</p>
            
            {/* Search Card */}
            <Card className="shadow-2xl border-0">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Location */}
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2">LOCATION</Label>
                    <AutocompleteInput
                      placeholder="City, Area, Hotel"
                      suggestions={hotelCitySuggestions}
                      value={hotelLocation}
                      onChange={(value) => {
                        setHotelLocation(value);
                        setSearchTerm(value);
                      }}
                      className="border-0 p-0 h-8 font-semibold focus-visible:ring-0"
                    />
                  </div>

                  {/* Check-in */}
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2">CHECK-IN</Label>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <Input 
                        type="date"
                        value={checkInDate}
                        onChange={(e) => setCheckInDate(e.target.value)}
                        className="border-0 p-0 h-8 font-semibold focus-visible:ring-0"
                      />
                    </div>
                  </div>

                  {/* Check-out */}
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2">CHECK-OUT</Label>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <Input 
                        type="date"
                        value={checkOutDate}
                        onChange={(e) => setCheckOutDate(e.target.value)}
                        className="border-0 p-0 h-8 font-semibold focus-visible:ring-0"
                      />
                    </div>
                  </div>

                  {/* Guests */}
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2">GUESTS</Label>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <select className="border-0 p-0 h-8 font-semibold bg-transparent focus:outline-none">
                        <option>1 Room, 2 Guests</option>
                        <option>2 Rooms, 4 Guests</option>
                        <option>3 Rooms, 6 Guests</option>
                      </select>
                    </div>
                  </div>
                </div>

                <Button 
                  size="lg" 
                  className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-bold h-12"
                  onClick={handleSearch}
                >
                  <Search className="w-5 h-5 mr-2" />
                  SEARCH HOTELS
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
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters - Desktop - Only show after search */}
          {hasSearched && (
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
                    {(selectedRatings.length > 0 || priceRange[0] > 0 || priceRange[1] < 20000) && (
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
                    <h4 className="font-semibold mb-4 text-sm">Price Range (per night)</h4>
                    <div className="space-y-4">
                      <Slider
                        value={priceRange}
                        onValueChange={setPriceRange}
                        min={0}
                        max={20000}
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

                  {/* Star Rating Filter */}
                  <div>
                    <h4 className="font-semibold mb-4 text-sm">Star Rating</h4>
                    <div className="space-y-3">
                      {[5, 4, 3, 2].map((rating) => (
                        <div key={rating} className="flex items-center space-x-3">
                          <Checkbox
                            id={`rating-${rating}`}
                            checked={selectedRatings.includes(rating)}
                            onCheckedChange={() => toggleRating(rating)}
                          />
                          <label
                            htmlFor={`rating-${rating}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1 flex items-center gap-1"
                          >
                            {rating}
                            <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                            {rating > 1 && '& above'}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Amenities Filter */}
                  <div>
                    <h4 className="font-semibold mb-4 text-sm">Popular Amenities</h4>
                    <div className="space-y-3">
                      {[
                        { label: 'Free WiFi', icon: Wifi },
                        { label: 'Breakfast', icon: Coffee },
                        { label: 'Gym', icon: Dumbbell },
                        { label: 'Parking', icon: Car }
                      ].map((amenity) => (
                        <div key={amenity.label} className="flex items-center space-x-3">
                          <Checkbox id={amenity.label.toLowerCase()} />
                          <label
                            htmlFor={amenity.label.toLowerCase()}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1 flex items-center gap-2"
                          >
                            <amenity.icon className="w-3 h-3" />
                            {amenity.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </aside>
          )}

          {/* Hotels List */}
          <main className="flex-1 space-y-4">
            {!hasSearched ? (
              // Initial Empty State - No Search Performed Yet
              <Card className="border-2 border-dashed">
                <CardContent className="py-24 text-center">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                    <Building2 className="w-12 h-12 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Discover Amazing Hotels</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Enter your destination and travel dates above, then click <span className="font-semibold text-green-600">"SEARCH HOTELS"</span> to find the perfect stay
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
                      {filteredHotels?.length || 0} Hotels Available
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Find the perfect accommodation for your stay
                    </p>
                  </div>
                  <select className="border rounded-lg px-4 py-2 text-sm font-medium bg-background">
                    <option>Recommended</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                    <option>Guest Rating</option>
                  </select>
                </div>

                {/* Mobile Filter Button */}
                <div className="lg:hidden mb-4">
                  <Button 
                    variant="outline"
                    className="w-full gap-2"
                  >
                    <Filter className="w-4 h-4" />
                    Filters {selectedRatings.length > 0 && `(${selectedRatings.length})`}
                  </Button>
                </div>

                {/* Loading State */}
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Card key={i}>
                        <CardContent className="p-6">
                          <div className="flex items-center gap-4">
                            <Skeleton className="h-32 w-48 rounded" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-6 w-1/3" />
                              <Skeleton className="h-4 w-1/4" />
                              <Skeleton className="h-4 w-1/2" />
                            </div>
                            <Skeleton className="h-10 w-28" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : filteredHotels?.length === 0 ? (
                  // Empty State
                  <Card>
                    <CardContent className="py-16 text-center">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                        <Building2 className="w-10 h-10 text-muted-foreground opacity-50" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">No hotels found</h3>
                      <p className="text-muted-foreground mb-4">
                        Try adjusting your filters or search criteria
                      </p>
                      <Button onClick={clearAllFilters} variant="outline">
                        Clear All Filters
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  // Hotel Cards
                  <div className="space-y-4">
                    {filteredHotels.map((hotel) => {
                      const finalPrice = hotel.pricePerNight + markup;
                      
                      return (
                        <Card
                          key={hotel.id}
                          className="overflow-hidden hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20"
                        >
                          <CardContent className="p-0">
                            <div className="flex flex-col lg:flex-row">
                              {/* Hotel Image */}
                              <div className="lg:w-64 h-48 lg:h-auto relative overflow-hidden bg-muted">
                                <img 
                                  src={hotel.imageUrl || "https://placehold.co/400x300/e2e8f0/64748b?text=Hotel"} 
                                  alt={hotel.name}
                                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                />
                              </div>

                              {/* Hotel Info */}
                              <div className="flex-1 p-6">
                                {/* Title & Rating */}
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <h3 className="text-2xl font-bold mb-2">{hotel.name}</h3>
                                    <div className="flex items-center gap-1 mb-2">
                                      {Array.from({ length: hotel.stars }).map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                                      ))}
                                    </div>
                                  </div>
                                  <div className="bg-primary text-primary-foreground font-bold px-3 py-1.5 rounded-lg text-sm flex items-center gap-1">
                                    {hotel.rating.toFixed(1)} <Star className="w-3 h-3 fill-current" />
                                  </div>
                                </div>

                                {/* Location */}
                                <p className="text-muted-foreground flex items-center text-sm mb-4">
                                  <MapPin className="w-4 h-4 mr-1 shrink-0" /> {hotel.location}
                                </p>

                                {/* Amenities */}
                                {hotel.amenities && hotel.amenities.length > 0 && (
                                  <div className="flex flex-wrap gap-2 pt-4 border-t">
                                    {hotel.amenities.slice(0, 5).map((amenity, i) => (
                                      <Badge key={i} variant="outline" className="text-xs">
                                        {amenity}
                                      </Badge>
                                    ))}
                                    {hotel.amenities.length > 5 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{hotel.amenities.length - 5} more
                                      </Badge>
                                    )}
                                  </div>
                                )}

                                {/* Review Count */}
                                <p className="text-xs text-muted-foreground mt-4">
                                  {hotel.reviewCount} reviews
                                </p>
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
                                  <p className="text-xs text-muted-foreground">per night</p>
                                </div>

                                <div className="space-y-2 mt-4">
                                  <Link href={`/hotels/${hotel.id}`}>
                                    <Button className="w-full bg-green-600 hover:bg-green-700 font-bold">
                                      View Rooms
                                    </Button>
                                  </Link>
                                  <Link href={`/hotels/${hotel.id}`}>
                                    <Button variant="outline" className="w-full text-xs">
                                      <ArrowRight className="w-3 h-3 mr-1" />
                                      Details
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
              </>
            )}
          </main>
        </div>
      </div>
    </Layout>
  );
}
