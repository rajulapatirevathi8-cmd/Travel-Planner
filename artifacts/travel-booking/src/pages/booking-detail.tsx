import { useState } from "react";
import { Layout } from "@/components/layout";
import { Link, useParams } from "wouter";
import { useGetBooking, useCancelBooking } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Printer,
  Download,
  Mail,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plane,
  Bus,
  Building2,
  Map,
  Calendar,
  Users,
  CreditCard,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
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

export default function BookingDetail() {
  const { id } = useParams();
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const bookingId = parseInt(id || "0", 10);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const cancelBooking = useCancelBooking();

  const { data: booking, isLoading } = useGetBooking(bookingId, {
    query: { enabled: !!bookingId, queryKey: [`/api/bookings/${bookingId}`] },
  });

  const totalPrice = ((booking as any)?.price || 0) - discount;

  

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Skeleton className="h-8 w-48 mb-8" />
          <Skeleton className="h-32 w-full mb-8 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!booking) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <h2 className="text-2xl font-bold mb-4">Booking not found</h2>
          <Button asChild>
            <Link href="/bookings">Back to my bookings</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "flight":
        return <Plane className="w-8 h-8" />;
      case "bus":
        return <Bus className="w-8 h-8" />;
      case "hotel":
        return <Building2 className="w-8 h-8" />;
      case "package":
        return <Map className="w-8 h-8" />;
      default:
        return <Map className="w-8 h-8" />;
    }
  };

  const handleCancel = () => {
    cancelBooking.mutate(
      { id: bookingId },
      {
        onSuccess: () => {
          toast({
            title: "Booking Cancelled",
            description: "Your booking has been successfully cancelled.",
          });
          queryClient.invalidateQueries({
            queryKey: [`/api/bookings/${bookingId}`],
          });
          queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Cancellation Failed",
            description: "There was an error cancelling your booking.",
          });
        },
      },
    );
  };

  return (
    <Layout>
      <div className="bg-muted/20 pb-12 pt-6 border-b">
        <div className="container mx-auto px-4 max-w-5xl">
          <Button
            variant="ghost"
            asChild
            className="mb-6 pl-0 hover:bg-transparent"
          >
            <Link
              href="/bookings"
              className="text-muted-foreground flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to My Bookings
            </Link>
          </Button>

          <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center bg-card p-6 md:p-8 rounded-2xl shadow-sm border">
            <div className="flex items-center gap-6">
              <div
                className={`p-4 rounded-2xl ${booking.status === "cancelled" ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}
              >
                {getIcon(booking.bookingType)}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    {booking.bookingType} Booking
                  </span>
                  {booking.status === "confirmed" && (
                    <Badge className="bg-green-500">Confirmed</Badge>
                  )}
                  {booking.status === "pending" && (
                    <Badge
                      variant="secondary"
                      className="bg-yellow-500/20 text-yellow-700"
                    >
                      Pending
                    </Badge>
                  )}
                  {booking.status === "cancelled" && (
                    <Badge variant="destructive">Cancelled</Badge>
                  )}
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold">
                  {(booking.details?.title as string) ||
                    `Booking Reference: ${booking.referenceId}`}
                </h1>
                <p className="text-muted-foreground mt-1">
                  Booked on{" "}
                  {booking.createdAt
                    ? format(new Date(booking.createdAt), "MMMM do, yyyy")
                    : "Unknown Date"}
                </p>
              </div>
            </div>

            <div className="flex w-full md:w-auto gap-3">
              <Button variant="outline" className="flex-1 md:flex-none">
                <Printer className="w-4 h-4 mr-2" /> Print
              </Button>
              {booking.status !== "cancelled" && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="flex-1 md:flex-none"
                    >
                      Cancel
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2" /> Cancel Booking
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to cancel this booking? This
                        action cannot be undone. A cancellation confirmation
                        email will be sent to {booking.passengerEmail}.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={handleCancel}
                        disabled={cancelBooking.isPending}
                      >
                        {cancelBooking.isPending
                          ? "Cancelling..."
                          : "Yes, Cancel"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Passenger Details */}
          <Card className="shadow-sm border-muted">
            <CardHeader className="bg-muted/10 border-b pb-4">
              <CardTitle className="text-lg flex items-center">
                <Users className="w-5 h-5 mr-2 text-primary" /> Passenger
                Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">
                  Primary Contact
                </p>
                <p className="text-lg font-semibold">{booking.passengerName}</p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground font-medium mb-1">
                    Email
                  </p>
                  <p className="font-medium truncate">
                    {booking.passengerEmail}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium mb-1">
                    Phone
                  </p>
                  <p className="font-medium">
                    {booking.passengerPhone || "Not provided"}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">
                  Total Passengers
                </p>
                <p className="font-medium">{booking.passengers} Person(s)</p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card className="shadow-sm border-muted">
            <CardHeader className="bg-muted/10 border-b pb-4">
              <CardTitle className="text-lg flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-primary" /> Payment
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">
                  Booking Reference ID
                </p>
                <p className="text-lg font-mono font-semibold bg-muted px-3 py-1 rounded inline-block">
                  WND-{booking.id.toString().padStart(6, "0")}
                </p>
              </div>

              <div className="border-t border-dashed pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Base Price ({booking.passengers}x)
                  </span>
                  <span>₹{(booking.totalPrice * 0.85).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Taxes & Fees (15%)
                  </span>
                  <span>₹{(booking.totalPrice * 0.15).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-3 border-t">
                  <span>Total Paid</span>
                  <span className="text-primary">
                    ₹{booking.totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Important Info */}
          {booking.status === "confirmed" && (
            <div className="md:col-span-2 bg-green-500/10 border border-green-500/20 rounded-xl p-6 flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-green-800 mb-1">
                  You're all set!
                </h4>
                <p className="text-green-700/80 text-sm leading-relaxed">
                  Your booking is confirmed. A detailed itinerary and receipt
                  have been sent to {booking.passengerEmail}. Please keep this
                  reference handy and present it upon arrival.
                </p>
              </div>
            </div>
          )}

          {booking.status === "cancelled" && (
            <div className="md:col-span-2 bg-destructive/10 border border-destructive/20 rounded-xl p-6 flex items-start gap-4">
              <XCircle className="w-6 h-6 text-destructive shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-destructive mb-1">
                  Booking Cancelled
                </h4>
                <p className="text-destructive/80 text-sm leading-relaxed">
                  This booking has been cancelled. If a refund is applicable per
                  the provider's policy, it will be processed to your original
                  payment method within 5-7 business days.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
