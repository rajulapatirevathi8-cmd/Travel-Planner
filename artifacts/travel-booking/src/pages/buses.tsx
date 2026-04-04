import { useState } from "react";
import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { useListBuses } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Bus, Search, ArrowRight, Filter, Wind, Wifi, Coffee, Music, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function Buses() {
  const { data: buses, isLoading } = useListBuses();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBuses = buses?.filter(bus => 
    bus.destination.toLowerCase().includes(searchTerm.toLowerCase()) || 
    bus.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bus.operator.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="bg-secondary/5 py-12 border-b">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-extrabold mb-6">Search Buses</h1>
          <div className="bg-background p-4 rounded-xl shadow-lg border max-w-4xl flex flex-col md:flex-row gap-4 items-center">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input 
                placeholder="Search origin, destination, or operator..." 
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
                <h4 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wider">Bus Type</h4>
                <div className="space-y-2">
                  {['Sleeper', 'Semi-Sleeper', 'Seater', 'AC', 'Non-AC'].map(c => (
                    <label key={c} className="flex items-center space-x-3 cursor-pointer">
                      <input type="checkbox" className="rounded border-input text-primary focus:ring-primary" />
                      <span className="text-sm">{c}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="w-full lg:w-3/4 space-y-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">{filteredBuses?.length || 0} Buses found</h2>
            <select className="border-input bg-background rounded-md text-sm p-2 border">
              <option>Sort by Price: Low to High</option>
              <option>Sort by Price: High to Low</option>
              <option>Sort by Departure Time</option>
            </select>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-48 w-full rounded-xl" />
              ))}
            </div>
          ) : filteredBuses?.length === 0 ? (
            <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed">
              <Bus className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-20" />
              <h3 className="text-xl font-bold text-muted-foreground">No buses found</h3>
              <p className="text-muted-foreground mt-2">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBuses?.map((bus) => (
                <Card key={bus.id} className="overflow-hidden hover:shadow-md transition-shadow border-muted">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="p-6 flex-1 border-b md:border-b-0 md:border-r border-muted flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <p className="font-bold text-foreground text-lg">{bus.operator}</p>
                            <p className="text-sm text-muted-foreground">{bus.busNumber}</p>
                          </div>
                          <Badge variant="secondary" className="uppercase font-semibold tracking-wider text-[10px]">
                            {bus.busType}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between mb-4">
                          <div className="text-center">
                            <p className="text-2xl font-extrabold">{bus.departureTime}</p>
                            <p className="text-sm font-medium text-muted-foreground mt-1">{bus.origin}</p>
                          </div>
                          
                          <div className="flex-1 px-4 flex flex-col items-center">
                            <p className="text-xs text-muted-foreground font-semibold mb-1">{bus.duration}</p>
                            <div className="w-full relative flex items-center justify-center">
                              <div className="h-[2px] w-full bg-border absolute"></div>
                              <Bus className="w-4 h-4 text-muted-foreground bg-background px-1 relative z-10" />
                            </div>
                          </div>

                          <div className="text-center">
                            <p className="text-2xl font-extrabold">{bus.arrivalTime}</p>
                            <p className="text-sm font-medium text-muted-foreground mt-1">{bus.destination}</p>
                          </div>
                        </div>
                        
                        {bus.amenities && bus.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-muted/50">
                            {bus.amenities.slice(0, 4).map((amenity, i) => (
                              <span key={i} className="inline-flex items-center text-xs bg-secondary/10 text-secondary-foreground px-2 py-1 rounded-md">
                                {getAmenityIcon(amenity)} <span className="ml-1">{amenity}</span>
                              </span>
                            ))}
                            {bus.amenities.length > 4 && (
                              <span className="inline-flex items-center text-xs bg-muted text-muted-foreground px-2 py-1 rounded-md">
                                +{bus.amenities.length - 4} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="bg-muted/10 p-6 md:w-64 flex flex-col justify-center items-center text-center space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground font-medium mb-1">Price per seat</p>
                          <p className="text-3xl font-extrabold text-primary">${bus.price}</p>
                        </div>
                        <Button asChild className="w-full font-bold">
                          <Link href={`/buses/${bus.id}`}>Select Seat <ArrowRight className="w-4 h-4 ml-2" /></Link>
                        </Button>
                        <p className="text-xs text-muted-foreground">{bus.seatsAvailable} seats left</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </Layout>
  );
}
