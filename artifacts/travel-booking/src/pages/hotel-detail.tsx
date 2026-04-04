import { Layout } from "@/components/layout";
import { Link, useParams } from "wouter";
import { useGetHotel } from "@workspace/api-client-react";
import { BookingForm } from "@/components/booking-form";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Star, MapPin, CheckCircle2, BedDouble, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function HotelDetail() {
  const { id } = useParams();
  const hotelId = parseInt(id || "0", 10);
  
  const { data: hotel, isLoading } = useGetHotel(hotelId, {
    query: { enabled: !!hotelId, queryKey: [`/api/hotels/${hotelId}`] }
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-[400px] w-full rounded-2xl" />
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
            <div>
              <Skeleton className="h-96 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!hotel) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <h2 className="text-2xl font-bold mb-4">Hotel not found</h2>
          <Button asChild><Link href="/hotels">Back to hotels</Link></Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-muted/20 border-b">
        <div className="container mx-auto px-4 py-6">
          <Button variant="ghost" asChild className="mb-4 pl-0 hover:bg-transparent">
            <Link href="/hotels" className="text-muted-foreground flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to search results
            </Link>
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
            <div>
              <div className="flex items-center space-x-1 mb-3">
                {Array.from({ length: hotel.stars }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-accent fill-accent" />
                ))}
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-3">{hotel.name}</h1>
              <p className="text-muted-foreground flex items-center text-lg">
                <MapPin className="w-5 h-5 mr-2 text-primary" /> {hotel.address || hotel.location}
              </p>
            </div>
            <div className="flex items-center gap-4 bg-background p-4 rounded-xl shadow-sm border">
              <div className="bg-primary text-primary-foreground font-bold px-4 py-3 rounded-lg text-2xl flex items-center">
                {hotel.rating.toFixed(1)}
              </div>
              <div>
                <p className="font-bold text-lg">Excellent</p>
                <p className="text-sm text-muted-foreground">{hotel.reviewCount} verified reviews</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-10">
            {/* Gallery */}
            <div className="rounded-2xl overflow-hidden shadow-lg h-[400px] relative group">
              <img 
                src={hotel.imageUrl || "https://placehold.co/1200x800/e2e8f0/64748b"} 
                alt={hotel.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>

            {/* About */}
            <section>
              <h2 className="text-2xl font-bold mb-4">About this hotel</h2>
              <div className="prose prose-muted max-w-none">
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {hotel.description || `Experience luxury and comfort at ${hotel.name}. Located in the heart of ${hotel.location}, our hotel offers world-class amenities and exceptional service to ensure your stay is unforgettable.`}
                </p>
              </div>
            </section>

            {/* Amenities */}
            <section>
              <h2 className="text-2xl font-bold mb-6">Popular Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {hotel.amenities?.map((amenity, idx) => (
                  <div key={idx} className="flex items-center p-4 bg-muted/30 rounded-xl border border-muted/50">
                    <CheckCircle2 className="w-5 h-5 text-primary mr-3 shrink-0" />
                    <span className="font-medium">{amenity}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Room Types */}
            {hotel.roomTypes && hotel.roomTypes.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-6">Available Room Types</h2>
                <div className="space-y-4">
                  {hotel.roomTypes.map((room, idx) => (
                    <div key={idx} className="flex items-center justify-between p-6 bg-card rounded-xl border shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <BedDouble className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{room}</h3>
                          <p className="text-sm text-muted-foreground">Sleeps 2 guests</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">Available</Badge>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <BookingForm 
                bookingType="hotel" 
                referenceId={hotel.id} 
                pricePerUnit={hotel.pricePerNight} 
                title={hotel.name}
              />
              
              <div className="bg-muted/30 p-6 rounded-xl flex items-start gap-4">
                <ShieldCheck className="w-8 h-8 text-primary shrink-0" />
                <div>
                  <h4 className="font-bold mb-2">Price Match Guarantee</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">Find a lower price? We'll refund the difference. Book now with total confidence.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
