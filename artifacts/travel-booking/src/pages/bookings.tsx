import { Layout } from "@/components/layout";
import { useListBookings, useCancelBooking } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Link } from "wouter";
import { format } from "date-fns";
import { Plane, Bus, Building2, Map, ExternalLink, AlertCircle, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useQueryClient } from "@tanstack/react-query";

export default function Bookings() {
  const { data: bookings, isLoading } = useListBookings();
  const cancelBooking = useCancelBooking();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const getIcon = (type: string) => {
    switch (type) {
      case 'flight': return <Plane className="w-5 h-5" />;
      case 'bus': return <Bus className="w-5 h-5" />;
      case 'hotel': return <Building2 className="w-5 h-5" />;
      case 'package': return <Map className="w-5 h-5" />;
      default: return <Map className="w-5 h-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed': 
        return <Badge className="bg-green-500 hover:bg-green-600">Confirmed</Badge>;
      case 'pending': 
        return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-700 hover:bg-yellow-500/30">Pending</Badge>;
      case 'cancelled': 
        return <Badge variant="destructive">Cancelled</Badge>;
      default: 
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleCancel = (id: number) => {
    cancelBooking.mutate(
      { id },
      {
        onSuccess: () => {
          toast({
            title: "Booking Cancelled",
            description: "Your booking has been successfully cancelled.",
          });
          queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Cancellation Failed",
            description: "There was an error cancelling your booking.",
          });
        }
      }
    );
  };

  return (
    <Layout>
      <div className="bg-muted/30 py-12 border-b">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-extrabold tracking-tight">My Bookings</h1>
          <p className="text-muted-foreground mt-2 text-lg">Manage your upcoming trips and past travel history.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-64 w-full rounded-xl" />
            ))}
          </div>
        ) : !bookings || bookings.length === 0 ? (
          <div className="text-center py-24 bg-card rounded-2xl border shadow-sm max-w-2xl mx-auto">
            <Map className="w-16 h-16 mx-auto text-muted-foreground/30 mb-6" />
            <h3 className="text-2xl font-bold mb-2">No bookings yet</h3>
            <p className="text-muted-foreground mb-8">It looks like you haven't booked any trips. Ready to start an adventure?</p>
            <Button asChild size="lg" className="rounded-full px-8">
              <Link href="/">Explore Destinations</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {bookings.sort((a,b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).map((booking) => (
              <Card key={booking.id} className={`overflow-hidden transition-all border-muted shadow-sm hover:shadow-md ${booking.status === 'cancelled' ? 'opacity-75 bg-muted/30' : ''}`}>
                <CardHeader className="pb-4 border-b bg-muted/10 flex flex-row items-center justify-between space-y-0">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${booking.status === 'cancelled' ? 'bg-muted' : 'bg-primary/10 text-primary'}`}>
                      {getIcon(booking.bookingType)}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">
                        {booking.bookingType} • ID: #{booking.id}
                      </p>
                      <CardTitle className="text-lg">
                        {booking.details?.title as string || `Booking #${booking.referenceId}`}
                      </CardTitle>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {getStatusBadge(booking.status)}
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Travel Date</p>
                      <p className="font-semibold text-foreground">
                        {format(new Date(booking.travelDate), "MMM do, yyyy")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Passengers</p>
                      <p className="font-semibold text-foreground">{booking.passengers}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Passenger Name</p>
                      <p className="font-semibold text-foreground truncate">{booking.passengerName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                      <p className="font-bold text-primary text-lg">${booking.totalPrice}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/5 border-t p-4 flex justify-between">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/bookings/${booking.id}`}>
                      View Details <ExternalLink className="w-3 h-3 ml-2" />
                    </Link>
                  </Button>
                  
                  {booking.status !== 'cancelled' && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                          Cancel
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center text-destructive">
                            <AlertCircle className="w-5 h-5 mr-2" /> Cancel Booking
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to cancel this booking? This action cannot be undone. 
                            Depending on the cancellation policy, you may be charged a fee.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                          <AlertDialogAction 
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => handleCancel(booking.id)}
                            disabled={cancelBooking.isPending}
                          >
                            {cancelBooking.isPending ? "Cancelling..." : "Yes, Cancel Booking"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
