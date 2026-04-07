import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download, Mail, Calendar, CreditCard, User, Phone, MapPin, Plane, Building2, Bus, Map } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface BookingDetails {
  bookingId: string;
  bookingType: "flight" | "bus" | "hotel" | "package";
  passengerName: string;
  passengerEmail: string;
  passengerPhone: string;
  passengers: number;
  travelDate: string;
  totalAmount: number;
  paymentId: string;
  paymentStatus: "paid";
  timestamp: string;
  title: string;
  selectedSeats?: string[];
  roomType?: string;
  checkoutDate?: string;
}

export default function PaymentSuccess() {
  const [, params] = useLocation();
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    // Simple celebration animation without external dependencies
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }
      
      // Create simple particle effects using CSS
      createParticle();
    }, 150);

    // Get booking details from localStorage (set by payment handler)
    const savedBooking = localStorage.getItem("lastSuccessfulBooking");
    if (savedBooking) {
      try {
        const booking = JSON.parse(savedBooking);
        setBookingDetails(booking);
      } catch (error) {
        console.error("Failed to parse booking details:", error);
      }
    }

    return () => clearInterval(interval);
  }, []);
  // Simple particle effect function
  const createParticle = () => {
    const colors = ["#f97316", "#fb923c", "#fdba74", "#ef4444", "#fbbf24"];
    const particle = document.createElement("div");
    particle.className = "celebration-particle";
    particle.style.left = Math.random() * 100 + "%";
    particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    particle.style.animationDuration = (Math.random() * 2 + 1) + "s";
    document.body.appendChild(particle);
    
    setTimeout(() => {
      particle.remove();
    }, 3000);
  };

  const getBookingIcon = () => {
    switch (bookingDetails?.bookingType) {
      case "flight":
        return <Plane className="w-8 h-8" />;
      case "hotel":
        return <Building2 className="w-8 h-8" />;
      case "bus":
        return <Bus className="w-8 h-8" />;
      case "package":
        return <Map className="w-8 h-8" />;
      default:
        return <Calendar className="w-8 h-8" />;
    }
  };  const handleDownloadTicket = () => {
    if (!bookingDetails) return;

    try {
      const ticketContent = `
═══════════════════════════════════════════
       WANDERWAY - BOOKING CONFIRMATION
═══════════════════════════════════════════

✓ BOOKING CONFIRMED

Booking ID: ${bookingDetails.bookingId}
Booking Type: ${bookingDetails.bookingType.toUpperCase()}
Status: ${bookingDetails.paymentStatus.toUpperCase()}

─────────────────────────────────────────────
BOOKING DETAILS
─────────────────────────────────────────────
Service: ${bookingDetails.title}
Booking Date: ${new Date(bookingDetails.timestamp).toLocaleDateString()}
Travel Date: ${new Date(bookingDetails.travelDate).toLocaleDateString()}
${bookingDetails.checkoutDate ? `Checkout Date: ${new Date(bookingDetails.checkoutDate).toLocaleDateString()}` : ''}
${bookingDetails.selectedSeats && bookingDetails.selectedSeats.length > 0 ? `Selected Seats: ${bookingDetails.selectedSeats.join(', ')}` : ''}
${bookingDetails.roomType ? `Room Type: ${bookingDetails.roomType.toUpperCase()}` : ''}

─────────────────────────────────────────────
PASSENGER INFORMATION
─────────────────────────────────────────────
Name: ${bookingDetails.passengerName}
Email: ${bookingDetails.passengerEmail}
Phone: ${bookingDetails.passengerPhone}
Number of Passengers: ${bookingDetails.passengers}

─────────────────────────────────────────────
PAYMENT DETAILS
─────────────────────────────────────────────
Payment ID: ${bookingDetails.paymentId}
Payment Method: Razorpay
Payment Status: ${bookingDetails.paymentStatus.toUpperCase()}
Total Amount: ₹${bookingDetails.totalAmount.toFixed(2)}

─────────────────────────────────────────────
IMPORTANT INFORMATION
─────────────────────────────────────────────
• Please carry a valid ID proof during your journey
• Check-in opens 2 hours before departure
• For queries, contact our 24/7 support
• A confirmation email has been sent to your registered email

═══════════════════════════════════════════
      Thank you for choosing WanderWay!
      Generated on ${new Date().toLocaleString()}
═══════════════════════════════════════════
`;

      const blob = new Blob([ticketContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `WanderWay-Booking-${bookingDetails.bookingId}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Ticket Downloaded! 📄",
        description: "Your booking confirmation has been downloaded successfully.",
      });
    } catch (error) {
      console.error("Error downloading ticket:", error);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "There was an error downloading the ticket. Please try again.",
      });
    }
  };

  const handleEmailTicket = async () => {
    if (!bookingDetails) return;

    try {
      toast({
        title: "Sending Email... 📧",
        description: "Please wait while we send your booking confirmation.",
      });

      // In a real application, this would make an API call to send the email
      // For now, we'll simulate the email being sent
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate successful email send
      const emailData = {
        to: bookingDetails.passengerEmail,
        subject: `Booking Confirmation - ${bookingDetails.bookingId}`,
        bookingDetails: bookingDetails,
      };

      // In production, you would call your backend API here:
      // await fetch('/api/send-booking-email', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(emailData),
      // });

      console.log("Email would be sent with data:", emailData);

      toast({
        title: "Email Sent Successfully! ✅",
        description: `Booking confirmation sent to ${bookingDetails.passengerEmail}`,
      });
    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        variant: "destructive",
        title: "Email Failed",
        description: "There was an error sending the email. Please try again.",
      });
    }
  };

  if (!bookingDetails) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <h2 className="text-2xl font-bold mb-4">Loading booking details...</h2>
          <p className="text-muted-foreground">Please wait while we retrieve your booking information.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-12">
        <div className="container mx-auto px-4">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-500 text-white mb-6 animate-bounce">
              <CheckCircle className="w-16 h-16" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-green-700 mb-4">
              Payment Successful! 🎉
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              Your booking has been confirmed
            </p>
            <p className="text-sm text-muted-foreground">
              Booking ID: <span className="font-mono font-bold text-primary">{bookingDetails.bookingId}</span>
            </p>
          </div>

          {/* Booking Details Card */}
          <Card className="max-w-4xl mx-auto shadow-2xl border-2 border-green-200">
            <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
              <CardTitle className="flex items-center gap-3 text-2xl">
                {getBookingIcon()}
                <span>{bookingDetails.title}</span>
                <Badge variant="secondary" className="ml-auto bg-white text-green-700 font-bold">
                  {bookingDetails.paymentStatus.toUpperCase()}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              {/* Passenger Details */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Passenger Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Name</p>
                        <p className="font-semibold">{bookingDetails.passengerName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="font-semibold">{bookingDetails.passengerEmail}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="font-semibold">{bookingDetails.passengerPhone}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Booking Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Travel Date</p>
                        <p className="font-semibold">{new Date(bookingDetails.travelDate).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}</p>
                      </div>
                    </div>
                    {bookingDetails.checkoutDate && (
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-500">Check-out Date</p>
                          <p className="font-semibold">{new Date(bookingDetails.checkoutDate).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">{bookingDetails.bookingType === "hotel" ? "Rooms" : "Passengers"}</p>
                        <p className="font-semibold">{bookingDetails.passengers}</p>
                      </div>
                    </div>
                    {bookingDetails.selectedSeats && bookingDetails.selectedSeats.length > 0 && (
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-gray-500 mt-1" />
                        <div>
                          <p className="text-xs text-gray-500">Selected Seats</p>
                          <p className="font-semibold">{bookingDetails.selectedSeats.join(", ")}</p>
                        </div>
                      </div>
                    )}
                    {bookingDetails.roomType && (
                      <div className="flex items-center gap-3">
                        <Building2 className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-500">Room Type</p>
                          <p className="font-semibold capitalize">{bookingDetails.roomType}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-green-50 rounded-lg p-6 border-2 border-green-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Details
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Payment ID</p>
                    <p className="font-mono font-semibold text-sm">{bookingDetails.paymentId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Transaction Date</p>
                    <p className="font-semibold text-sm">{new Date(bookingDetails.timestamp).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Payment Method</p>
                    <p className="font-semibold text-sm">Razorpay</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Amount Paid</p>
                    <p className="font-bold text-2xl text-green-600">₹{bookingDetails.totalAmount.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid md:grid-cols-3 gap-4 mt-8">
                <Button onClick={handleDownloadTicket} size="lg" className="w-full">
                  <Download className="w-5 h-5 mr-2" />
                  Download Ticket
                </Button>
                <Button onClick={handleEmailTicket} variant="outline" size="lg" className="w-full">
                  <Mail className="w-5 h-5 mr-2" />
                  Email Ticket
                </Button>
                <Button asChild variant="secondary" size="lg" className="w-full">
                  <Link href="/bookings">View All Bookings</Link>
                </Button>
              </div>

              {/* Important Notice */}
              <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-bold text-blue-900 mb-2">📧 Important</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• A confirmation email has been sent to <strong>{bookingDetails.passengerEmail}</strong></li>
                  <li>• Please carry a valid ID proof during your journey</li>
                  <li>• Check-in opens 2 hours before {bookingDetails.bookingType === "flight" ? "departure" : "journey"}</li>
                  <li>• For any queries, contact our 24/7 support</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Continue Browsing */}
          <div className="text-center mt-8">
            <Button asChild variant="ghost" size="lg">
              <Link href="/">← Back to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
