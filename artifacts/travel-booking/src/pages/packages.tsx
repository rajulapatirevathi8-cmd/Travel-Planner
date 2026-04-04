import { useState } from "react";
import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { useListPackages } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Map, Search, ArrowRight, Star, Clock, Filter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Packages() {
  const { data: packages, isLoading } = useListPackages();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const filteredPackages = packages?.filter(pkg => 
    (pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     pkg.destination.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (typeFilter ? pkg.type === typeFilter : true)
  );

  return (
    <Layout>
      <div className="bg-background relative py-20 border-b overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">Curated <span className="text-primary">Adventures</span></h1>
          <p className="text-xl text-muted-foreground mb-10">Handpicked holiday packages for every type of traveler.</p>
          
          <div className="bg-card p-4 rounded-2xl shadow-xl border max-w-3xl mx-auto flex flex-col md:flex-row gap-4 items-center">
            <div className="relative w-full flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input 
                placeholder="Search destinations or packages..." 
                className="pl-12 h-14 text-base border-muted rounded-xl bg-muted/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="h-14 px-4 border rounded-xl bg-muted/20 w-full md:w-auto"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="beach">Beach</option>
              <option value="adventure">Adventure</option>
              <option value="cultural">Cultural</option>
              <option value="luxury">Luxury</option>
              <option value="family">Family</option>
              <option value="honeymoon">Honeymoon</option>
            </select>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold flex items-center">
            {filteredPackages?.length || 0} Packages Available
          </h2>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-muted-foreground hidden sm:block" />
            <select className="border-input bg-background rounded-lg text-sm p-2.5 border font-medium">
              <option>Recommended</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Duration: Short to Long</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-[450px] w-full rounded-2xl" />
            ))}
          </div>
        ) : filteredPackages?.length === 0 ? (
          <div className="text-center py-32 bg-muted/10 rounded-3xl border border-dashed max-w-2xl mx-auto">
            <Map className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-20" />
            <h3 className="text-2xl font-bold text-foreground">No packages found</h3>
            <p className="text-muted-foreground mt-2 text-lg">Try adjusting your search filters to see more results</p>
            <Button variant="outline" className="mt-6" onClick={() => { setSearchTerm(''); setTypeFilter(''); }}>
              Clear all filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPackages?.map((pkg) => (
              <Card key={pkg.id} className="overflow-hidden border-0 shadow-lg group hover:shadow-xl transition-all duration-300 rounded-2xl flex flex-col h-full bg-card">
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={pkg.imageUrl || "https://placehold.co/800x600/e2e8f0/64748b"} 
                    alt={pkg.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
                  
                  <div className="absolute top-4 left-4 bg-background/90 backdrop-blur text-foreground font-bold px-3 py-1 rounded-full text-xs shadow-md uppercase tracking-wider">
                    {pkg.type}
                  </div>
                  
                  {pkg.originalPrice && pkg.price < pkg.originalPrice && (
                    <div className="absolute top-4 right-4 bg-destructive text-destructive-foreground font-bold px-3 py-1 rounded-full text-sm shadow-md">
                      Sale
                    </div>
                  )}

                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-2xl font-bold text-white mb-1 leading-tight line-clamp-2">{pkg.name}</h3>
                    <p className="text-white/80 font-medium flex items-center text-sm">
                      <Map className="w-4 h-4 mr-1" /> {pkg.destination}
                    </p>
                  </div>
                </div>
                
                <CardContent className="p-6 flex-1 flex flex-col justify-between">
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-muted">
                      <div className="flex items-center text-muted-foreground font-medium text-sm">
                        <Clock className="w-4 h-4 mr-1 text-primary" /> {pkg.duration} Days
                      </div>
                      <div className="flex items-center text-foreground font-bold text-sm bg-accent/20 text-accent-foreground px-2 py-1 rounded-md">
                        <Star className="w-3.5 h-3.5 mr-1 fill-current" /> {pkg.rating?.toFixed(1) || "4.5"}
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                      {pkg.description || `Discover the beauty of ${pkg.destination} with our exclusive ${pkg.duration}-day package.`}
                    </p>
                  </div>
                  
                  <div className="flex items-end justify-between mt-auto pt-4">
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold mb-1 uppercase tracking-wider">Starting from</p>
                      <div className="flex items-end gap-2">
                        <p className="text-3xl font-extrabold text-foreground">${pkg.price}</p>
                        {pkg.originalPrice && (
                          <p className="text-sm text-muted-foreground line-through mb-1">${pkg.originalPrice}</p>
                        )}
                      </div>
                    </div>
                    <Button asChild size="lg" className="rounded-xl px-6">
                      <Link href={`/packages/${pkg.id}`}>View Details</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
