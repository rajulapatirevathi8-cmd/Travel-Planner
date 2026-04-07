import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useCreateBooking } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, ArrowLeft, CheckCircle2, XCircle, LogIn, ShieldAlert } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PaymentOptions } from "@/components/payment-options";
import { countryCodes } from "@/lib/country-codes";
import { Badge } from "@/components/ui/badge";

type Coupon = { code: string; discount: number };

const passengerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  countryCode: z.string().min(1, { message: "Please select a country code." }),
  phone: z.string()
    .min(10, { message: "Phone number must be exactly 10 digits." })
    .max(10, { message: "Phone number must be exactly 10 digits." })
    .regex(/^\d{10}$/, { message: "Phone number must be exactly 10 digits without spaces or special characters." }),
  gender: z.enum(["male", "female", "other"], { required_error: "Please select a gender" }),
  age: z.number().min(1).max(120, { message: "Age must be between 1 and 120" }),
});

const formSchema = z.object({
  passengerDetails: z.array(passengerSchema).min(1),
});

export default function PassengerDetailsPage() {
  const searchParams = new URLSearchParams(useSearch());
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createBooking = useCreateBooking();
  const { isAuthenticated, user } = useAuth();
  
  // Get booking details from URL params
  const bookingType = searchParams.get("type") as "flight" | "bus" | "hotel" | "package";
  const referenceId = parseInt(searchParams.get("id") || "0", 10);
  const pricePerUnit = parseFloat(searchParams.get("price") || "0");
  const title = searchParams.get("title") || "";
  const passengersCount = parseInt(searchParams.get("passengers") || "1", 10);
  const selectedSeats = searchParams.get("seats")?.split(",") || [];
  const travelDate = searchParams.get("date") || new Date().toISOString().split("T")[0];

  const [markup, setMarkup] = useState(0);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponStatus, setCouponStatus] = useState<"idle" | "valid" | "invalid">("idle");
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    const saved = parseFloat(localStorage.getItem("markup") ?? "0");
    setMarkup(isNaN(saved) ? 0 : saved);
  }, []);

  // Validate that we have required data
  useEffect(() => {
    if (!bookingType || !referenceId || !pricePerUnit || selectedSeats.length === 0) {
      toast({
        variant: "destructive",
        title: "Invalid Booking Data",
        description: "Missing booking information. Please start from seat selection.",
      });
      setLocation("/");
    }
  }, [bookingType, referenceId, pricePerUnit, selectedSeats, setLocation, toast]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      passengerDetails: Array.from({ length: passengersCount }, () => ({
        name: "",
        email: "",
        countryCode: "+91",
        phone: "",
        gender: undefined as any,
        age: undefined as any,
      })),
    },
  });

  const basePrice = pricePerUnit * passengersCount;
  const discount = appliedCoupon ? appliedCoupon.discount : 0;
  const finalPrice = Math.max(0, basePrice + markup - discount);

  function applyCoupon() {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    const coupons: Coupon[] = JSON.parse(localStorage.getItem("coupons") ?? "[]");
    const found = coupons.find((c) => c.code === code);
    if (found) {
      setAppliedCoupon(found);
      setCouponStatus("valid");
      toast({ title: "Coupon applied!", description: `${found.code} — ₹${found.discount} off` });
    } else {
      setAppliedCoupon(null);
      setCouponStatus("invalid");
      toast({ variant: "destructive", title: "Invalid coupon", description: `"${code}" is not a valid coupon code.` });
    }
  }

  function removeCoupon() {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponStatus("idle");
  }

  function handlePayment() {
    if (!isAuthenticated || !user) {
      toast({
        variant: "destructive",
        title: "Login Required",
        description: "Please login to complete your booking",
      });
      return;
    }

    form.trigger().then((isValid) => {
      if (!isValid) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Please fill all required fields correctly.",
        });
        return;
      }
      
      setShowPaymentDialog(true);
    });
  }

  function handlePaymentMethodSelected(method: "card" | "upi" | "wallet" | "emi", emiTenure?: number) {
    setIsProcessingPayment(true);
    const values = form.getValues();

    setTimeout(() => {
      saveBookingWithPayment(values, method, "paid", undefined, emiTenure);
      setIsProcessingPayment(false);
      setShowPaymentDialog(false);
      
      toast({
        title: "Payment Successful! 🎉",
        description: `Booking confirmed using ${method.toUpperCase()}. Redirecting...`,
      });

      setTimeout(() => {
        setLocation("/bookings?success=true");
      }, 1000);
    }, 1500);
  }

  function saveBookingWithPayment(
    values: z.infer<typeof formSchema>,
    method: string,
    status: string,
    paymentId?: string,
    emiTenure?: number
  ) {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "User not authenticated. Please login again.",
      });      return;
    }    const booking = {
      bookingType: bookingType,
      referenceId,
      passengerName: values.passengerDetails[0].name,
      passengerEmail: values.passengerDetails[0].email,
      passengerPhone: `${values.passengerDetails[0].countryCode}${values.passengerDetails[0].phone}`,
      passengers: passengersCount,
      travelDate,
      details: {
        userId: user.id,
        type: bookingType,
        status,
        customerName: values.passengerDetails[0].name,
        customerEmail: values.passengerDetails[0].email,
        customerPhone: `${values.passengerDetails[0].countryCode}${values.passengerDetails[0].phone}`,
        customerGender: values.passengerDetails[0].gender,
        passengerDetails: values.passengerDetails.map((p) => ({
          ...p,
          phone: `${p.countryCode}${p.phone}`,
        })),
        selectedSeats: selectedSeats,
        amount: finalPrice,
        paymentMethod: method,
        paymentId: paymentId ?? `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        emiTenure: method === "emi" ? emiTenure : undefined,
        createdAt: new Date().toISOString(),
      }
    };

    createBooking.mutate({ data: booking });
  }
  const handleBack = () => {
    // Go back to seat selection
    const params = new URLSearchParams({
      type: bookingType,
      id: referenceId.toString(),
      price: pricePerUnit.toString(),
      title: title,
    });
    setLocation(`/booking/seat-selection/${bookingType}/${referenceId}?${params.toString()}`);
  };

  // Dynamic labels based on booking type
  const isHotel = bookingType === "hotel";
  const passengerLabel = isHotel ? "Guest" : "Passenger";
  const passengersLabel = isHotel ? "Guests" : "Passengers";
  const seatLabel = isHotel ? "Room" : "Seat";
  const seatsLabel = isHotel ? "Rooms" : "Seats";
  const selectionLabel = isHotel ? "Room Selection" : "Seat Selection";

  return (
    <Layout>
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 py-6">
          <Button variant="ghost" onClick={handleBack} className="mb-4 pl-0 hover:bg-transparent">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to {selectionLabel}
          </Button>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold">{passengerLabel} Details</h1>
              <p className="text-muted-foreground mt-2">{title}</p>
            </div>
            <div className="text-left md:text-right">
              <p className="text-sm text-muted-foreground font-medium mb-1">Total Amount</p>
              <p className="text-3xl font-extrabold text-primary">₹{finalPrice}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {!isAuthenticated && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <ShieldAlert className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              You need to be logged in to complete the booking.{" "}
              <Button variant="link" asChild className="p-0 h-auto text-orange-600 underline">
                <a href="/login">Login here</a>
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Passenger Details Form */}
          <div className="lg:col-span-2 space-y-6">
            <Form {...form}>
              <form className="space-y-6">                {/* Selected Seats Display */}
                <Card>
                  <CardHeader>
                    <CardTitle>Selected {seatsLabel}</CardTitle>
                    <CardDescription>You have selected {selectedSeats.length} {selectedSeats.length === 1 ? seatLabel.toLowerCase() : seatsLabel.toLowerCase()}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedSeats.map((seat, index) => (
                        <Badge key={seat} variant="secondary" className="px-3 py-2 text-base">
                          {seatLabel} {index + 1}: {seat}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Passenger Details Cards */}
                {Array.from({ length: passengersCount }, (_, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle>
                        {passengerLabel} {index + 1} Details
                        {index === 0 && <span className="text-sm font-normal text-muted-foreground ml-2">(Primary Contact)</span>}
                      </CardTitle>
                      <CardDescription>
                        {seatLabel}: <Badge variant="outline">{selectedSeats[index]}</Badge>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name={`passengerDetails.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`passengerDetails.${index}.gender`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Gender *</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select gender" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="male">Male</SelectItem>
                                  <SelectItem value="female">Female</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`passengerDetails.${index}.age`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Age *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={1}
                                  max={120}
                                  placeholder="Enter age"
                                  {...field}
                                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>                      <FormField
                        control={form.control}
                        name={`passengerDetails.${index}.email`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address *</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="passenger@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Phone Number *
                        </label>
                        <div className="flex gap-2">
                          <FormField
                            control={form.control}
                            name={`passengerDetails.${index}.countryCode`}
                            render={({ field }) => (
                              <FormItem className="w-32">
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="max-h-[300px]">
                                    {countryCodes.map((country) => (
                                      <SelectItem key={country.code} value={country.code}>
                                        {country.flag} {country.code}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`passengerDetails.${index}.phone`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <Input
                                    type="tel"
                                    placeholder="10-digit number"
                                    maxLength={10}
                                    {...field}
                                    onChange={(e) => {
                                      const value = e.target.value.replace(/\D/g, "");
                                      field.onChange(value);
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </form>
            </Form>
          </div>

          {/* Price Summary Sidebar */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Price Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Coupon Section */}
                <div>
                  <h3 className="font-semibold mb-3">Apply Coupon</h3>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="Enter coupon code"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      disabled={!!appliedCoupon}
                    />
                    {appliedCoupon ? (
                      <Button variant="outline" onClick={removeCoupon}>
                        <XCircle className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button variant="outline" onClick={applyCoupon}>
                        Apply
                      </Button>
                    )}
                  </div>
                  {couponStatus === "valid" && (
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Coupon applied successfully!
                    </p>
                  )}
                  {couponStatus === "invalid" && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <XCircle className="w-4 h-4" /> Invalid coupon code
                    </p>
                  )}
                </div>                {/* Price Breakdown */}
                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span>Base Price × {passengersCount}</span>
                    <span>₹{basePrice}</span>
                  </div>
                  {markup > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Markup</span>
                      <span>₹{markup}</span>
                    </div>
                  )}
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>-₹{discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total</span>
                    <span className="text-primary">₹{finalPrice}</span>
                  </div>
                </div>

                {/* Payment Button */}
                <Button
                  onClick={handlePayment}
                  disabled={!isAuthenticated || createBooking.isPending}
                  className="w-full"
                  size="lg"
                >
                  {!isAuthenticated ? (
                    <>
                      <LogIn className="w-4 h-4 mr-2" />
                      Login to Book
                    </>
                  ) : createBooking.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Proceed to Payment"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Choose Payment Method</DialogTitle>
          </DialogHeader>          <PaymentOptions
            userId={user?.id || null}
            totalAmount={finalPrice}
            onPaymentSelect={handlePaymentMethodSelected}
          />
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
