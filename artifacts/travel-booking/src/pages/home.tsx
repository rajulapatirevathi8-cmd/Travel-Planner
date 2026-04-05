import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { useGetPopularDestinations, useGetFeaturedDeals, useGetStatsSummary } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plane, Bus, Building2, Map, Search, ArrowRight, Star, ShieldCheck, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { data: destinations, isLoading: destinationsLoading } = useGetPopularDestinations();
  const { data: deals, isLoading: dealsLoading } = useGetFeaturedDeals();
  const { data: stats } = useGetStatsSummary();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden min-h-[600px] flex items-center pt-16 pb-32">
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/hero.png" 
            alt="Tropical ocean sunset" 
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background/90" />
        </div>

        <div className="container relative z-10 mx-auto px-4 md:px-6 mt-10">
          <div className="max-w-3xl mb-12 text-white">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4 drop-shadow-lg leading-tight">
              Let the journey <span className="text-primary">begin.</span>
            </h1>
            <p className="text-xl text-white/90 font-medium max-w-2xl drop-shadow-md">
              Discover extraordinary destinations, exclusive deals, and unforgettable experiences. Your next adventure starts here.
            </p>
          </div>

          <Card className="w-full max-w-4xl shadow-2xl border-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <CardContent className="p-2 sm:p-4">
              <Tabs defaultValue="flights" className="w-full">
                <TabsList className="grid w-full grid-cols-4 h-14 bg-muted/50 rounded-lg p-1">
                  <TabsTrigger value="flights" className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm sm:text-base font-semibold">
                    <Plane className="w-4 h-4 mr-2 hidden sm:inline-block" /> Flights
                  </TabsTrigger>
                  <TabsTrigger value="hotels" className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm sm:text-base font-semibold">
                    <Building2 className="w-4 h-4 mr-2 hidden sm:inline-block" /> Hotels
                  </TabsTrigger>
                  <TabsTrigger value="buses" className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm sm:text-base font-semibold">
                    <Bus className="w-4 h-4 mr-2 hidden sm:inline-block" /> Buses
                  </TabsTrigger>
                  <TabsTrigger value="packages" className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm sm:text-base font-semibold">
                    <Map className="w-4 h-4 mr-2 hidden sm:inline-block" /> Packages
                  </TabsTrigger>
                </TabsList>
                
                {/* Search forms simplified for home page - they redirect to full search pages */}
                <TabsContent value="flights" className="pt-6 pb-2 px-2">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-1 space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">From</label>
                      <input type="text" placeholder="City or Airport" className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                    </div>
                    <div className="md:col-span-1 space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">To</label>
                      <input type="text" placeholder="City or Airport" className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                    </div>
                    <div className="md:col-span-1 space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</label>
                      <input type="date" className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                    </div>
                    <div className="md:col-span-1 flex items-end">
                      <Button asChild size="lg" className="w-full h-12 text-md font-bold">
                        <Link href="/flights">
                          <Search className="w-5 h-5 mr-2" /> Search Flights
                        </Link>
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="hotels" className="pt-6 pb-2 px-2">
                   <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Location</label>
                      <input type="text" placeholder="Where are you going?" className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                    </div>
                    <div className="md:col-span-1 space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dates</label>
                      <input type="date" className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                    </div>
                    <div className="md:col-span-1 flex items-end">
                      <Button asChild size="lg" className="w-full h-12 text-md font-bold">
                        <Link href="/hotels">
                          <Search className="w-5 h-5 mr-2" /> Search Hotels
                        </Link>
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="buses" className="pt-6 pb-2 px-2">
                   <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-1 space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Leaving From</label>
                      <input type="text" placeholder="City" className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                    </div>
                    <div className="md:col-span-1 space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Going To</label>
                      <input type="text" placeholder="City" className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                    </div>
                    <div className="md:col-span-1 space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</label>
                      <input type="date" className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                    </div>
                    <div className="md:col-span-1 flex items-end">
                      <Button asChild size="lg" className="w-full h-12 text-md font-bold">
                        <Link href="/buses">
                          <Search className="w-5 h-5 mr-2" /> Search Buses
                        </Link>
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="packages" className="pt-6 pb-2 px-2">
                   <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Destination</label>
                      <input type="text" placeholder="Where do you want to go?" className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                    </div>
                    <div className="md:col-span-1 space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Package Type</label>
                      <select className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                        <option value="">Any Type</option>
                        <option value="beach">Beach</option>
                        <option value="adventure">Adventure</option>
                        <option value="cultural">Cultural</option>
                      </select>
                    </div>
                    <div className="md:col-span-1 flex items-end">
                      <Button asChild size="lg" className="w-full h-12 text-md font-bold">
                        <Link href="/packages">
                          <Search className="w-5 h-5 mr-2" /> Find Packages
                        </Link>
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 bg-muted/30 border-b">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center p-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold mb-2">Secure Booking</h3>
              <p className="text-muted-foreground">Bank-level security for all your transactions and personal data.</p>
            </div>
            <div className="flex flex-col items-center p-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                <Star className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold mb-2">Premium Experience</h3>
              <p className="text-muted-foreground">Handpicked selections ensuring the highest quality for your journey.</p>
            </div>
            <div className="flex flex-col items-center p-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold mb-2">24/7 Support</h3>
              <p className="text-muted-foreground">Our travel experts are always available to help you anywhere, anytime.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight mb-2">Trending Destinations</h2>
              <p className="text-muted-foreground text-lg">Discover the most sought-after places this season.</p>
            </div>
            <Button variant="ghost" asChild className="hidden sm:flex">
              <Link href="/packages">Explore all <ArrowRight className="w-4 h-4 ml-2" /></Link>
            </Button>
          </div>

          {destinationsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-80 w-full rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {destinations?.slice(0, 4).map((dest) => (
                <Link key={dest.id} href={`/packages?destination=${dest.name}`}>
                  <div className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer">
                    <img 
                      src={dest.imageUrl || "https://placehold.co/400x600/e2e8f0/64748b"} 
                      alt={dest.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 w-full p-6 text-white">
                      <h3 className="text-xl font-bold mb-1">{dest.name}</h3>
                      <p className="text-sm text-white/80 font-medium mb-3">{dest.country}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">
                          {dest.packageCount} Packages
                        </span>
                        <span className="font-bold">From ₹{dest.startingPrice}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Deals */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight mb-4">Unbeatable Offers</h2>
            <p className="text-muted-foreground text-lg">Exclusive deals handpicked for the modern traveler. Limited time only.</p>
          </div>

          {dealsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-64 w-full rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {deals?.slice(0, 3).map((deal) => (
                <Card key={deal.id} className="overflow-hidden border-0 shadow-lg group hover-elevate hover:shadow-xl transition-all">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={deal.imageUrl || "https://placehold.co/600x400/e2e8f0/64748b"} 
                      alt={deal.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-4 right-4 bg-destructive text-destructive-foreground font-bold px-3 py-1 rounded-full text-sm shadow-md">
                      {deal.discountPercent}% OFF
                    </div>
                    <div className="absolute top-4 left-4 bg-primary text-primary-foreground font-semibold px-3 py-1 rounded-full text-xs shadow-md uppercase tracking-wider">
                      {deal.type}
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-1">{deal.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{deal.description}</p>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground line-through">₹{deal.originalPrice}</p>
                        <p className="text-2xl font-bold text-foreground">₹{deal.discountedPrice}</p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/${deal.type}s/${deal.referenceId}`}>View Deal</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
