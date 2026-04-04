import { useState } from "react";
import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { useListFlights } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plane, Search, Clock, ArrowRight, Filter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function Flights() {
  const { data: flights, isLoading } = useListFlights();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFlights = flights?.filter(flight => 
    flight.destination.toLowerCase().includes(searchTerm.toLowerCase()) || 
    flight.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    flight.airline.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="bg-primary/5 py-12 border-b">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-extrabold mb-6">Search Flights</h1>
          <div className="bg-background p-4 rounded-xl shadow-lg border max-w-4xl flex flex-col md:flex-row gap-4 items-center">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input 
                placeholder="Search origin, destination, or airline..." 
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
                <h4 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wider">Class</h4>
                <div className="space-y-2">
                  {['Economy', 'Business', 'First Class'].map(c => (
                    <label key={c} className="flex items-center space-x-3 cursor-pointer">
                      <input type="checkbox" className="rounded border-input text-primary focus:ring-primary" />
                      <span className="text-sm">{c}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wider">Stops</h4>
                <div className="space-y-2">
                  {['Direct', '1 Stop', '2+ Stops'].map(s => (
                    <label key={s} className="flex items-center space-x-3 cursor-pointer">
                      <input type="checkbox" className="rounded border-input text-primary focus:ring-primary" />
                      <span className="text-sm">{s}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="w-full lg:w-3/4 space-y-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">{filteredFlights?.length || 0} Flights found</h2>
            <select className="border-input bg-background rounded-md text-sm p-2 border">
              <option>Sort by Price: Low to High</option>
              <option>Sort by Price: High to Low</option>
              <option>Sort by Duration</option>
            </select>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-40 w-full rounded-xl" />
              ))}
            </div>
          ) : filteredFlights?.length === 0 ? (
            <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed">
              <Plane className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-20" />
              <h3 className="text-xl font-bold text-muted-foreground">No flights found</h3>
              <p className="text-muted-foreground mt-2">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFlights?.map((flight) => (
                <Card key={flight.id} className="overflow-hidden hover:shadow-md transition-shadow border-muted">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="p-6 flex-1 border-b md:border-b-0 md:border-r border-muted flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                              {flight.airline.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-foreground">{flight.airline}</p>
                              <p className="text-xs text-muted-foreground">{flight.flightNumber}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="uppercase font-semibold tracking-wider text-[10px]">
                            {flight.class}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-center">
                            <p className="text-2xl font-extrabold">{flight.departureTime}</p>
                            <p className="text-sm font-medium text-muted-foreground mt-1">{flight.origin}</p>
                          </div>
                          
                          <div className="flex-1 px-8 flex flex-col items-center">
                            <p className="text-xs text-muted-foreground font-semibold mb-1 flex items-center">
                              <Clock className="w-3 h-3 mr-1" /> {flight.duration}
                            </p>
                            <div className="w-full relative flex items-center justify-center">
                              <div className="h-[2px] w-full bg-border absolute"></div>
                              <Plane className="w-4 h-4 text-primary bg-background px-1 relative z-10" />
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold tracking-wider">
                              {flight.stops === 0 ? 'Direct' : `${flight.stops} Stop(s)`}
                            </p>
                          </div>

                          <div className="text-center">
                            <p className="text-2xl font-extrabold">{flight.arrivalTime}</p>
                            <p className="text-sm font-medium text-muted-foreground mt-1">{flight.destination}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-muted/10 p-6 md:w-64 flex flex-col justify-center items-center text-center space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground font-medium mb-1">Price per adult</p>
                          <p className="text-3xl font-extrabold text-primary">${flight.price}</p>
                        </div>
                        <Button asChild className="w-full font-bold">
                          <Link href={`/flights/${flight.id}`}>Select <ArrowRight className="w-4 h-4 ml-2" /></Link>
                        </Button>
                        <p className="text-xs text-muted-foreground">{flight.seatsAvailable} seats left</p>
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
