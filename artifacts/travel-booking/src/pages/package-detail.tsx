import { Layout } from "@/components/layout";
import { Link, useParams } from "wouter";
import { useGetPackage } from "@workspace/api-client-react";
import { BookingForm } from "@/components/booking-form";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Star, MapPin, Clock, Calendar, CheckCircle, ShieldCheck, Map } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function PackageDetail() {
  const { id } = useParams();
  const packageId = parseInt(id || "0", 10);
  
  const { data: pkg, isLoading } = useGetPackage(packageId, {
    query: { enabled: !!packageId, queryKey: [`/api/packages/${packageId}`] }
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <Skeleton className="h-8 w-32 mb-8" />
          <Skeleton className="h-[600px] w-full rounded-3xl mb-12" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full rounded-2xl" />
              <Skeleton className="h-96 w-full rounded-2xl" />
            </div>
            <div>
              <Skeleton className="h-96 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!pkg) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <h2 className="text-2xl font-bold mb-4">Package not found</h2>
          <Button asChild><Link href="/packages">Back to packages</Link></Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Header */}
      <div className="relative w-full h-[60vh] min-h-[500px] flex items-end pb-16">
        <div className="absolute inset-0 z-0">
          <img 
            src={pkg.imageUrl || "https://placehold.co/1920x1080/e2e8f0/64748b"} 
            alt={pkg.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
        </div>

        <div className="container relative z-10 mx-auto px-4">
          <Button variant="outline" size="sm" asChild className="mb-8 bg-black/30 border-white/20 text-white hover:bg-black/50 hover:text-white backdrop-blur-md">
            <Link href="/packages">
              <ArrowLeft className="w-4 h-4 mr-2" /> All Packages
            </Link>
          </Button>
          
          <div className="max-w-4xl text-white">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge className="bg-primary hover:bg-primary text-white border-0 px-3 py-1 text-sm uppercase tracking-wider">{pkg.type}</Badge>
              {pkg.featured && (
                <Badge variant="outline" className="bg-accent/20 border-accent text-accent px-3 py-1 text-sm">Featured</Badge>
              )}
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight drop-shadow-lg">{pkg.name}</h1>
            <div className="flex flex-wrap items-center gap-6 text-white/90 text-lg font-medium">
              <span className="flex items-center"><MapPin className="w-5 h-5 mr-2 text-primary" /> {pkg.destination}</span>
              <span className="flex items-center"><Clock className="w-5 h-5 mr-2 text-primary" /> {pkg.duration} Days</span>
              <span className="flex items-center"><Star className="w-5 h-5 mr-2 text-accent fill-accent" /> {pkg.rating?.toFixed(1) || "4.8"} ({pkg.reviewCount || 124} reviews)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            {/* Overview */}
            <section>
              <h2 className="text-3xl font-bold mb-6 flex items-center border-b pb-4">
                Overview
              </h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                {pkg.description || `Embark on an unforgettable ${pkg.duration}-day journey to ${pkg.destination}. This carefully crafted ${pkg.type} package includes everything you need for the perfect getaway, from accommodations to guided tours.`}
              </p>
            </section>

            {/* Highlights */}
            {pkg.highlights && pkg.highlights.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-6">Experience Highlights</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {pkg.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-start p-5 bg-secondary/5 rounded-2xl border border-secondary/10">
                      <Map className="w-6 h-6 text-primary mr-4 shrink-0" />
                      <span className="font-medium text-foreground">{highlight}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Inclusions */}
            {pkg.includes && pkg.includes.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-6">What's Included</h2>
                <div className="bg-card border rounded-2xl p-8 shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                    {pkg.includes.map((item, idx) => (
                      <div key={idx} className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 shrink-0" />
                        <span className="text-foreground font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-8">
              <div className="bg-card rounded-3xl shadow-xl border-0 overflow-hidden">
                <div className="bg-primary text-primary-foreground p-6 text-center">
                  <p className="text-primary-foreground/80 font-medium mb-1 uppercase tracking-wider text-sm">Package Price</p>
                  <div className="flex justify-center items-end gap-2">
                    <span className="text-5xl font-extrabold">₹{pkg.price}</span>
                    <span className="text-lg mb-1 opacity-80">/ person</span>
                  </div>
                  {pkg.originalPrice && (
                    <p className="mt-2 text-primary-foreground/70 line-through">Regular price: ₹{pkg.originalPrice}</p>
                  )}
                </div>
                <div className="p-6">
                  <BookingForm 
                    bookingType="package" 
                    referenceId={pkg.id} 
                    pricePerUnit={pkg.price} 
                    title={pkg.name}
                  />
                </div>
              </div>
              
              <div className="bg-muted/50 p-6 rounded-3xl flex items-start gap-4 border border-border/50">
                <ShieldCheck className="w-10 h-10 text-primary shrink-0" />
                <div>
                  <h4 className="font-bold text-lg mb-2">100% Secure Booking</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">Your payment information is encrypted and secure. We never store your credit card details.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
