import { useState } from "react";
import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { useListHotels } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Building2, Search, ArrowRight, Filter, Star, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function Hotels() {
  const { data: hotels, isLoading } = useListHotels();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredHotels = hotels?.filter(hotel => 
    hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    hotel.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="bg-accent/10 py-12 border-b">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-extrabold mb-6">Find Your Perfect Stay</h1>
          <div className="bg-background p-4 rounded-xl shadow-lg border max-w-4xl flex flex-col md:flex-row gap-4 items-center">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input 
                placeholder="Search by city, neighborhood, or hotel name..." 
                className="pl-10 h-12 text-base border-muted"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button size="lg" className="w-full md:w-auto h-12 px-8 font-bold">Search</Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-1/4 space-y-8">
          <div>
            <h3 className="font-bold text-lg mb-4 flex items-center"><Filter className="w-5 h-5 mr-2" /> Filters</h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wider">Star Rating</h4>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map(stars => (
                    <label key={stars} className="flex items-center space-x-3 cursor-pointer">
                      <input type="checkbox" className="rounded border-input text-primary focus:ring-primary" />
                      <span className="text-sm flex items-center">
                        {stars} <Star className="w-3 h-3 text-accent fill-accent ml-1" />
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wider">Popular Amenities</h4>
                <div className="space-y-2">
                  {['Free WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Parking'].map(amenity => (
                    <label key={amenity} className="flex items-center space-x-3 cursor-pointer">
                      <input type="checkbox" className="rounded border-input text-primary focus:ring-primary" />
                      <span className="text-sm">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="w-full lg:w-3/4 space-y-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">{filteredHotels?.length || 0} Hotels found</h2>
            <select className="border-input bg-background rounded-md text-sm p-2 border">
              <option>Recommended</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Guest Rating</option>
            </select>
          </div>

          {isLoading ? (
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-64 w-full rounded-xl" />
              ))}
            </div>
          ) : filteredHotels?.length === 0 ? (
            <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed">
              <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-20" />
              <h3 className="text-xl font-bold text-muted-foreground">No hotels found</h3>
              <p className="text-muted-foreground mt-2">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredHotels?.map((hotel) => (
                <Card key={hotel.id} className="overflow-hidden hover:shadow-lg transition-all border-muted group">
                  <div className="flex flex-col md:flex-row h-full">
                    <div className="md:w-1/3 relative h-48 md:h-auto overflow-hidden">
                      <img 
                        src={hotel.imageUrl || "https://placehold.co/600x400/e2e8f0/64748b"} 
                        alt={hotel.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    
                    <div className="flex-1 flex flex-col md:flex-row">
                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-2xl font-extrabold group-hover:text-primary transition-colors">{hotel.name}</h3>
                          </div>
                          
                          <div className="flex items-center space-x-1 mb-2">
                            {Array.from({ length: hotel.stars }).map((_, i) => (
                              <Star key={i} className="w-4 h-4 text-accent fill-accent" />
                            ))}
                          </div>
                          
                          <p className="text-muted-foreground flex items-center text-sm mb-4">
                            <MapPin className="w-4 h-4 mr-1 shrink-0" /> {hotel.location}
                          </p>
                          
                          {hotel.amenities && (
                            <div className="flex flex-wrap gap-2 mt-4">
                              {hotel.amenities.slice(0, 4).map((amenity, i) => (
                                <Badge key={i} variant="outline" className="bg-background font-normal text-xs">{amenity}</Badge>
                              ))}
                              {hotel.amenities.length > 4 && (
                                <Badge variant="outline" className="bg-muted font-normal text-xs">+{hotel.amenities.length - 4}</Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-muted/10 p-6 md:w-56 flex flex-col justify-between items-end border-t md:border-t-0 md:border-l border-muted">
                        <div className="text-right w-full flex flex-col items-end">
                          <div className="bg-primary text-primary-foreground font-bold px-3 py-1 rounded-lg text-lg flex items-center mb-1">
                            {hotel.rating.toFixed(1)} <Star className="w-4 h-4 ml-1 fill-current" />
                          </div>
                          <p className="text-xs text-muted-foreground mb-4">{hotel.reviewCount} reviews</p>
                        </div>
                        
                        <div className="w-full text-right mt-auto">
                          <p className="text-sm text-muted-foreground font-medium mb-1">Price per night</p>
                          <p className="text-3xl font-extrabold text-foreground mb-4">₹{hotel.pricePerNight}</p>
                          <Button asChild className="w-full font-bold">
                            <Link href={`/hotels/${hotel.id}`}>View Rooms <ArrowRight className="w-4 h-4 ml-2" /></Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </Layout>
  );
}
