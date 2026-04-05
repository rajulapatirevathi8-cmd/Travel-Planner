import { Layout } from "@/components/layout";
import { Link, useParams } from "wouter";
import { useGetBus } from "@workspace/api-client-react";
import { BookingForm } from "@/components/booking-form";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Bus as BusIcon, Clock, CheckCircle2, ShieldCheck, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function BusDetail() {
  const { id } = useParams();
  const busId = parseInt(id || "0", 10);
  
  const { data: bus, isLoading } = useGetBus(busId, {
    query: { enabled: !!busId, queryKey: [`/api/buses/${busId}`] }
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

  if (!bus) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <h2 className="text-2xl font-bold mb-4">Bus not found</h2>
          <Button asChild><Link href="/buses">Back to buses</Link></Button>
        </div>
      </Layout>
    );
  }


  return (
    <Layout>
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 py-6">
          <Button variant="ghost" asChild className="mb-4 pl-0 hover:bg-transparent">
            <Link href="/buses" className="text-muted-foreground flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to search results
            </Link>
          </Button>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="outline" className="bg-background font-bold text-base">{bus.operator}</Badge>
                <Badge variant="secondary" className="uppercase">{bus.busType}</Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold flex items-center flex-wrap gap-3">
                {bus.origin} <BusIcon className="w-6 h-6 text-primary" /> {bus.destination}
              </h1>
            </div>
            <div className="text-left md:text-right">
              <p className="text-sm text-muted-foreground font-medium mb-1">Price per seat</p>
              <p className="text-4xl font-extrabold text-primary">₹{bus.price}</p>
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
                <span>Journey Details</span>
                <span className="text-sm font-normal text-muted-foreground flex items-center">
                  <Clock className="w-4 h-4 mr-1" /> {bus.duration} total
                </span>
              </div>
              <div className="p-6 md:p-8">
                <div className="relative flex flex-col justify-between pl-8 border-l-2 border-border ml-4 space-y-12">
                  <div className="relative z-10">
                    <div className="absolute -left-[41px] w-6 h-6 rounded-full bg-primary flex items-center justify-center border-4 border-card"></div>
                    <div>
                      <p className="text-2xl font-bold">{bus.departureTime}</p>
                      <p className="font-medium text-lg flex items-center mt-1"><MapPin className="w-4 h-4 mr-1 text-muted-foreground" /> {bus.origin} Boarding Point</p>
                      <p className="text-sm text-muted-foreground mt-1">{bus.busType} · {bus.duration}</p>
                    </div>
                  </div>

                  <div className="relative z-10">
                    <div className="absolute -left-[41px] w-6 h-6 rounded-full bg-primary flex items-center justify-center border-4 border-card"></div>
                    <div>
                      <p className="text-2xl font-bold">{bus.arrivalTime}</p>
                      <p className="font-medium text-lg flex items-center mt-1"><MapPin className="w-4 h-4 mr-1 text-muted-foreground" /> {bus.destination} Drop Point</p>
                      <p className="text-sm text-muted-foreground mt-1">{bus.seatsAvailable} seats available</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Inclusions */}
            <div className="bg-card rounded-xl border p-6">
              <h3 className="font-bold text-xl mb-6">Bus Amenities</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {bus.amenities?.map((amenity, idx) => (
                  <div key={idx} className="flex items-center p-3 bg-muted/30 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 shrink-0" />
                    <span className="font-medium">{amenity}</span>
                  </div>
                ))}
                {(!bus.amenities || bus.amenities.length === 0) && (
                  <p className="text-muted-foreground">Standard amenities included.</p>
                )}
              </div>
            </div>
            
            <div className="bg-muted/30 p-4 rounded-xl flex items-start gap-4">
              <ShieldCheck className="w-6 h-6 text-primary shrink-0" />
              <div>
                <h4 className="font-bold text-sm mb-1">Safe and Secure Travel</h4>
                <p className="text-sm text-muted-foreground">All our partner operators follow strict safety and hygiene protocols.</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <BookingForm 
                bookingType="bus" 
                referenceId={bus.id} 
                pricePerUnit={bus.price} 
                title={`${bus.origin} to ${bus.destination}`}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
