import { Layout } from "@/components/layout";
import { Link, useParams } from "wouter";
import { useGetFlight } from "@workspace/api-client-react";
import { BookingForm } from "@/components/booking-form";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Plane, Clock, CheckCircle2, ShieldCheck, BaggageClaim, Utensils } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function FlightDetail() {
  const { id } = useParams();
  const flightId = parseInt(id || "0", 10);
  
  const { data: flight, isLoading } = useGetFlight(flightId, {
    query: { enabled: !!flightId, queryKey: [`/api/flights/${flightId}`] }
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full rounded-xl" />
              <Skeleton className="h-96 w-full rounded-xl" />
            </div>
            <div>
              <Skeleton className="h-96 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!flight) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <h2 className="text-2xl font-bold mb-4">Flight not found</h2>
          <Button asChild><Link href="/flights">Back to flights</Link></Button>
        </div>
      </Layout>
    );
  }


  return (
    <Layout>
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 py-6">
          <Button variant="ghost" asChild className="mb-4 pl-0 hover:bg-transparent">
            <Link href="/flights" className="text-muted-foreground flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to search results
            </Link>
          </Button>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="outline" className="bg-background">{flight.airline}</Badge>
                <Badge variant="secondary" className="uppercase">{flight.class}</Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold flex items-center flex-wrap gap-3">
                {flight.origin} <Plane className="w-6 h-6 text-primary" /> {flight.destination}
              </h1>
            </div>
            <div className="text-left md:text-right">
              <p className="text-sm text-muted-foreground font-medium mb-1">Price per passenger</p>
              <p className="text-4xl font-extrabold text-primary">${flight.price}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Itinerary */}
            <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
              <div className="bg-muted/50 p-4 border-b font-bold flex items-center justify-between">
                <span>Flight Itinerary</span>
                <span className="text-sm font-normal text-muted-foreground flex items-center">
                  <Clock className="w-4 h-4 mr-1" /> {flight.duration} total
                </span>
              </div>
              <div className="p-6 md:p-8">
                <div className="relative flex flex-col md:flex-row justify-between pl-6 md:pl-0">
                  <div className="hidden md:block absolute top-1/2 left-0 right-0 h-[2px] bg-border -translate-y-1/2 z-0"></div>
                  
                  {/* Vertical line for mobile */}
                  <div className="md:hidden absolute top-4 bottom-4 left-[11px] w-[2px] bg-border z-0"></div>

                  <div className="relative z-10 flex md:flex-col items-center gap-4 md:gap-2 mb-8 md:mb-0">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center border-4 border-card shrink-0"></div>
                    <div className="md:text-center">
                      <p className="text-xl font-bold">{flight.departureTime}</p>
                      <p className="font-medium">{flight.origin}</p>
                      <p className="text-xs text-muted-foreground">{flight.flightNumber}</p>
                    </div>
                  </div>

                  <div className="relative z-10 hidden md:flex flex-col items-center justify-center">
                    <div className="bg-card border px-3 py-1 rounded-full text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                      {flight.flightNumber}
                    </div>
                    <Plane className="w-6 h-6 text-primary/40" />
                  </div>

                  <div className="relative z-10 flex md:flex-col items-center gap-4 md:gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center border-4 border-card shrink-0"></div>
                    <div className="md:text-center">
                      <p className="text-xl font-bold">{flight.arrivalTime}</p>
                      <p className="font-medium">{flight.destination}</p>
                      <p className="text-xs text-muted-foreground">{flight.duration}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Inclusions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card rounded-xl border p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center">
                  <BaggageClaim className="w-5 h-5 mr-2 text-primary" /> Baggage
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                    <span className="text-sm">1 Personal item included</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                    <span className="text-sm">1 Carry-on bag (up to 7kg)</span>
                  </li>
                  <li className="flex items-start opacity-50">
                    <div className="w-5 h-5 border-2 rounded-full mr-2 shrink-0 mt-0.5"></div>
                    <span className="text-sm">Checked baggage not included</span>
                  </li>
                </ul>
              </div>
              <div className="bg-card rounded-xl border p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center">
                  <Utensils className="w-5 h-5 mr-2 text-primary" /> Amenities
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                    <span className="text-sm">Standard legroom (30")</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                    <span className="text-sm">USB power outlets</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                    <span className="text-sm">Free messaging via Wi-Fi</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="bg-muted/30 p-4 rounded-xl flex items-start gap-4">
              <ShieldCheck className="w-6 h-6 text-primary shrink-0" />
              <div>
                <h4 className="font-bold text-sm mb-1">Free cancellation within 24 hours</h4>
                <p className="text-sm text-muted-foreground">Book with confidence. You can cancel this booking for free up to 24 hours after purchase.</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <BookingForm 
                bookingType="flight" 
                referenceId={flight.id} 
                pricePerUnit={flight.price} 
                title={`${flight.origin} to ${flight.destination}`}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
