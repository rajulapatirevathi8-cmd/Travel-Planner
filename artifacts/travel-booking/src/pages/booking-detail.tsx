import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { Link, useParams, useLocation } from "wouter";
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

interface BookingDetail {
  id?: string | number;
  bookingId?: string;
  userId?: string;
  type?: string;
  bookingType?: string;
  referenceId?: number;
  passengerName?: string;
  customerName?: string;
  passengerEmail?: string;
  customerEmail?: string;
  passengerPhone?: string;
  customerPhone?: string;
  customerGender?: string;
  passengers?: number;
  passengerDetails?: Array<{
    name: string;
    email: string;
    phone: string;
    gender: "male" | "female" | "other";
    age: number;
  }>;
  travelDate?: string;
  checkoutDate?: string;
  selectedSeats?: string[];
  roomType?: string;
  totalAmount?: number;
  amount?: number;
  totalPrice?: number;
  paymentId?: string;
  orderId?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  status?: string;
  timestamp?: string;
  bookingDate?: string;
  createdAt?: string;
  title?: string;
  details?: {
    title?: string;
    passengers?: number;
    pricePerUnit?: number;
  };
  emiDetails?: {
    tenure?: number;
    monthlyAmount?: number;
    processingFee?: number;
  };
  couponCode?: string;
}

export default function BookingDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        // Try to fetch from API first (MSW will intercept)
        const response = await fetch(`/api/bookings/${id}`);
        
        if (response.ok) {
          const data = await response.json();
          setBooking(data);
        } else {
          // Fallback to localStorage for old bookings
          const bookingsStr = localStorage.getItem("bookings");
          if (bookingsStr) {
            const bookings: BookingDetail[] = JSON.parse(bookingsStr);
            
            const found = bookings.find(b => 
              b.bookingId === id || 
              b.id?.toString() === id ||
              (b as any).id === id
            );
            
            if (found) {
              setBooking(found);
            }
          }
        }
      } catch (error) {
        // Error occurred
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

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

  // Get gender-based color scheme
  const getGenderColors = (gender?: string) => {
    switch (gender?.toLowerCase()) {
      case 'male':
        return {
          border: 'border-l-8 border-l-blue-500',
          bg: 'bg-blue-50/50',
          icon: 'bg-blue-100 text-blue-600',
          badge: 'bg-blue-100 text-blue-700 border-blue-300'
        };
      case 'female':
        return {
          border: 'border-l-8 border-l-pink-500',
          bg: 'bg-pink-50/50',
          icon: 'bg-pink-100 text-pink-600',
          badge: 'bg-pink-100 text-pink-700 border-pink-300'
        };
      case 'other':
        return {
          border: 'border-l-8 border-l-purple-500',
          bg: 'bg-purple-50/50',
          icon: 'bg-purple-100 text-purple-600',
          badge: 'bg-purple-100 text-purple-700 border-purple-300'
        };
      default:
        return {
          border: '',
          bg: '',
          icon: 'bg-primary/10 text-primary',
          badge: ''
        };
    }
  };

  const genderColors = getGenderColors(booking?.customerGender);

  // Dynamic labels based on booking type
  const bookingType = booking.type || booking.bookingType || "package";
  const isHotel = bookingType === "hotel";
  const passengerLabel = isHotel ? "Guest" : "Passenger";
  const passengersLabel = isHotel ? "Guests" : "Passengers";
  const seatLabel = isHotel ? "Room" : "Seat";
  const seatsLabel = isHotel ? "Rooms" : "Seats";

  const handleCancel = async () => {
    if (!booking) return;
    
    const bookingId = booking.id || booking.bookingId;
    
    try {
      // Call API to cancel (MSW will intercept)
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        toast({
          title: "Booking Cancelled",
          description: "Your booking has been successfully cancelled.",
        });
        
        // Redirect back to bookings page
        setTimeout(() => {
          setLocation("/bookings");
        }, 1500);
      } else {
        throw new Error('Failed to cancel');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to cancel booking. Please try again.",
      });
    }
  };

  const handleDownloadTicket = () => {
    if (!booking) return;
    
    // Helper to get field values with fallbacks
    const bookingId = booking.id || booking.bookingId || 'N/A';
    const bookingType = booking.type || booking.bookingType || 'booking';
    const passengerName = booking.customerName || booking.passengerName || 'N/A';
    const passengerEmail = booking.customerEmail || booking.passengerEmail || 'N/A';
    const passengerPhone = booking.customerPhone || booking.passengerPhone || 'N/A';
    const totalAmount = booking.amount || booking.totalAmount || booking.totalPrice || 0;
    const status = booking.status || booking.paymentStatus || 'pending';
    const title = booking.title || booking.details?.title || 'Booking';
    const travelDate = booking.travelDate || booking.bookingDate || new Date().toISOString();
    const timestamp = booking.bookingDate || booking.timestamp || booking.createdAt || new Date().toISOString();
    
    const ticketContent = `
═══════════════════════════════════════════
       WANDERWAY - BOOKING CONFIRMATION
═══════════════════════════════════════════

Booking ID: ${bookingId}
Booking Type: ${bookingType.toUpperCase()}
Status: ${status.toUpperCase()}

─────────────────────────────────────────────
PASSENGER DETAILS
─────────────────────────────────────────────
Name: ${passengerName}
Email: ${passengerEmail}
Phone: ${passengerPhone}

─────────────────────────────────────────────
BOOKING DETAILS
─────────────────────────────────────────────
${title}
Travel Date: ${format(new Date(travelDate), "MMMM dd, yyyy")}
${booking.checkoutDate ? `Check-out Date: ${format(new Date(booking.checkoutDate), "MMMM dd, yyyy")}` : ''}
${bookingType === 'hotel' ? `Rooms: ${booking.passengers || 1}` : `Passengers: ${booking.passengers || 1}`}
${booking.selectedSeats && booking.selectedSeats.length > 0 ? `Selected Seats: ${booking.selectedSeats.join(', ')}` : ''}
${booking.roomType ? `Room Type: ${booking.roomType.charAt(0).toUpperCase() + booking.roomType.slice(1)}` : ''}

─────────────────────────────────────────────
PAYMENT DETAILS
─────────────────────────────────────────────
Payment ID: ${booking.paymentId || 'N/A'}
${booking.orderId ? `Order ID: ${booking.orderId}` : ''}
Amount Paid: ₹${totalAmount.toFixed(2)}
Payment Method: ${booking.paymentMethod?.toUpperCase() || 'Online'}
${booking.emiDetails ? `EMI: ${booking.emiDetails.tenure} months @ ₹${booking.emiDetails.monthlyAmount}/mo` : ''}
Transaction Date: ${format(new Date(timestamp), "MMMM dd, yyyy HH:mm:ss")}

═══════════════════════════════════════════
      Thank you for choosing WanderWay!
═══════════════════════════════════════════
`;

    const blob = new Blob([ticketContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `WanderWay-Ticket-${bookingId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Ticket Downloaded",
      description: "Your booking ticket has been downloaded successfully.",
    });
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

          <div className={`flex flex-col md:flex-row gap-6 justify-between items-start md:items-center bg-card p-6 md:p-8 rounded-2xl shadow-sm border ${genderColors.border} ${genderColors.bg}`}>
            <div className="flex items-center gap-6">
              <div
                className={`p-4 rounded-2xl ${(booking.status === "cancelled" || booking.paymentStatus === "cancelled") ? "bg-muted text-muted-foreground" : genderColors.icon}`}
              >
                {getIcon(booking.bookingType || booking.type || 'package')}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    {booking.bookingType || booking.type || 'Package'} Booking
                  </span>
                  {(booking.status === "confirmed" || booking.paymentStatus === "paid") && (
                    <Badge className="bg-green-500">Confirmed</Badge>
                  )}
                  {(booking.status === "pending" || booking.paymentStatus === "pending") && (
                    <Badge
                      variant="secondary"
                      className="bg-yellow-500/20 text-yellow-700"
                    >
                      Pending
                    </Badge>
                  )}
                  {(booking.status === "cancelled" || booking.paymentStatus === "cancelled") && (
                    <Badge variant="destructive">Cancelled</Badge>
                  )}
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold">
                  {booking.title || booking.details?.title || 
                    `Booking Reference: ${booking.referenceId || booking.id}`}
                </h1>
                <p className="text-muted-foreground mt-1">
                  Booked on{" "}
                  {booking.bookingDate || booking.timestamp || booking.createdAt
                    ? format(new Date(booking.bookingDate || booking.timestamp || booking.createdAt || new Date()), "MMMM do, yyyy")
                    : "Unknown Date"}
                </p>
              </div>
            </div>

            <div className="flex w-full md:w-auto gap-3">
              <Button variant="outline" className="flex-1 md:flex-none" onClick={handleDownloadTicket}>
                <Download className="w-4 h-4 mr-2" /> Download
              </Button>
              <Button variant="outline" className="flex-1 md:flex-none" asChild>
                <a href={`mailto:${booking.customerEmail || booking.passengerEmail}?subject=Your WanderWay Booking - ${booking.id || booking.bookingId}&body=Your booking details are attached.`}>
                  <Mail className="w-4 h-4 mr-2" /> Email
                </a>
              </Button>
              {(booking.status !== "cancelled" && booking.paymentStatus !== "cancelled") && (
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
                        email will be sent to {booking.customerEmail || booking.passengerEmail}.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={handleCancel}
                      >
                        Yes, Cancel
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
          <Card className={`shadow-sm ${genderColors.border} ${genderColors.bg}`}>
            <CardHeader className="bg-muted/10 border-b pb-4">
              <CardTitle className="text-lg flex items-center">
                <Users className="w-5 h-5 mr-2 text-primary" /> {passengerLabel}
                Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">
                  Name
                </p>
                <p className="text-lg font-semibold">
                  {booking.customerName || booking.passengerName || "Not provided"}
                </p>
              </div>
              {booking.customerGender && (
                <div>
                  <p className="text-sm text-muted-foreground font-medium mb-1">
                    Gender
                  </p>
                  <Badge className={`capitalize ${genderColors.badge}`} variant="outline">
                    {booking.customerGender}
                  </Badge>
                </div>
              )}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground font-medium mb-1">
                    Email
                  </p>
                  <p className="font-medium truncate">
                    {booking.customerEmail || booking.passengerEmail || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium mb-1">
                    Phone
                  </p>
                  <p className="font-medium">
                    {booking.customerPhone || booking.passengerPhone || "Not provided"}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">
                  Total {passengersLabel}
                </p>
                <p className="font-medium">{booking.passengers || 1} Person(s)</p>
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
                  {booking.id || booking.bookingId || 'N/A'}
                </p>
              </div>

              <div className="border-t border-dashed pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Base Price ({booking.passengers || 1}x)
                  </span>
                  <span>₹{(((booking.amount || booking.totalAmount || booking.totalPrice || 0) * 0.85).toFixed(2))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Taxes & Fees (15%)
                  </span>
                  <span>₹{(((booking.amount || booking.totalAmount || booking.totalPrice || 0) * 0.15).toFixed(2))}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-3 border-t">
                  <span>Total Paid</span>
                  <span className="text-primary">
                    ₹{((booking.amount || booking.totalAmount || booking.totalPrice || 0).toFixed(2))}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Travel Details */}
          {(booking.selectedSeats && booking.selectedSeats.length > 0) && (
            <Card className="shadow-sm border-muted">
              <CardHeader className="bg-muted/10 border-b pb-4">
                <CardTitle className="text-lg flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-primary" /> Travel Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground font-medium mb-2">
                    Selected {seatsLabel}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {booking.selectedSeats.map((seat: string) => (
                      <Badge key={seat} variant="secondary" className="font-mono">
                        {seat}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Important Info */}
          {(booking.status === "confirmed" || booking.paymentStatus === "paid") && (
            <div className="md:col-span-2 bg-green-500/10 border border-green-500/20 rounded-xl p-6 flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-green-800 mb-1">
                  You're all set!
                </h4>
                <p className="text-green-700/80 text-sm leading-relaxed">
                  Your booking is confirmed. A detailed itinerary and receipt
                  have been sent to {booking.customerEmail || booking.passengerEmail}. Please keep this
                  reference handy and present it upon arrival.
                </p>
              </div>
            </div>
          )}

          {(booking.status === "cancelled" || booking.paymentStatus === "cancelled") && (
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
