import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useCreateBooking } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Tag, CheckCircle2, XCircle } from "lucide-react";

type Coupon = { code: string; discount: number };

const formSchema = z.object({
  passengerName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  passengerEmail: z.string().email({ message: "Please enter a valid email address." }),
  passengerPhone: z.string().min(10, { message: "Phone number must be at least 10 digits." }),
  passengers: z.number().min(1).max(10),
  travelDate: z.string().min(1, "Date is required"),
});

type BookingFormProps = {
  bookingType: "flight" | "bus" | "hotel" | "package";
  referenceId: number;
  pricePerUnit: number;
  title: string;
};

export function BookingForm({ bookingType, referenceId, pricePerUnit, title }: BookingFormProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createBooking = useCreateBooking();

  const [markup, setMarkup] = useState(0);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponStatus, setCouponStatus] = useState<"idle" | "valid" | "invalid">("idle");

  useEffect(() => {
    const saved = parseFloat(localStorage.getItem("markup") ?? "0");
    setMarkup(isNaN(saved) ? 0 : saved);
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      passengerName: "",
      passengerEmail: "",
      passengerPhone: "",
      passengers: 1,
      travelDate: new Date().toISOString().split("T")[0],
    },
  });

  const passengersCount = form.watch("passengers");
  const basePrice = pricePerUnit * (passengersCount || 1);
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
      toast({ title: "Coupon applied!", description: `${found.code} — $${found.discount} off` });
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

  function submitBooking(values: z.infer<typeof formSchema>) {
    createBooking.mutate(
      {
        data: {
          bookingType,
          referenceId,
          passengerName: values.passengerName,
          passengerEmail: values.passengerEmail,
          passengerPhone: values.passengerPhone,
          passengers: values.passengers,
          travelDate: values.travelDate,
        },
      },
      {
        onSuccess: (data) => {
          toast({ title: "Booking Confirmed!", description: "Your booking has been successfully created." });
          setLocation(`/bookings/${data.id}`);
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Booking Failed",
            description: "There was an error creating your booking. Please try again.",
          });
        },
      },
    );
  }

  function saveToLocalStorage(values: z.infer<typeof formSchema>) {
    const existing = JSON.parse(localStorage.getItem("bookings") ?? "[]");
    existing.push({
      name: values.passengerName,
      phone: values.passengerPhone,
      email: values.passengerEmail,
      finalPrice,
      bookedAt: new Date().toISOString(),
    });
    localStorage.setItem("bookings", JSON.stringify(existing));
  }

  function handlePayment() {
    form.trigger().then((isValid) => {
      if (!isValid) return;
      const values = form.getValues();
      const options = {
        key: "rzp_test_xxxxx",
        amount: Math.round(finalPrice * 100),
        currency: "INR",
        name: "WanderWay",
        description: "Booking Payment",
        handler: function () {
          saveToLocalStorage(values);
          toast({ title: "Payment Successful!", description: "Creating your booking..." });
          submitBooking(values);
        },
        prefill: {
          name: values.passengerName,
          email: values.passengerEmail,
          contact: values.passengerPhone,
        },
        theme: { color: "#f97316" },
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    });
  }

  return (
    <Card className="w-full shadow-lg border-primary/10">
      <CardHeader className="bg-muted/50 border-b">
        <CardTitle className="text-xl">Book {title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <Form {...form}>
          <form className="space-y-4">
            <FormField
              control={form.control}
              name="passengerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="passengerEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input type="email" placeholder="john@example.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="passengerPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl><Input type="tel" placeholder="+1 (555) 000-0000" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="passengers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Passengers</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={10}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="travelDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Travel Date</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-1.5">
              <FormLabel>Coupon Code</FormLabel>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Enter coupon code"
                    value={couponInput}
                    onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponStatus("idle"); }}
                    className="pl-9 font-mono uppercase"
                    disabled={couponStatus === "valid"}
                  />
                </div>
                {couponStatus === "valid" ? (
                  <Button type="button" variant="outline" onClick={removeCoupon} className="text-destructive border-destructive/40">
                    Remove
                  </Button>
                ) : (
                  <Button type="button" variant="outline" onClick={applyCoupon}>
                    Apply
                  </Button>
                )}
              </div>
              {couponStatus === "valid" && appliedCoupon && (
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <CheckCircle2 className="w-3 h-3" /> {appliedCoupon.code} applied — ${appliedCoupon.discount} off
                </p>
              )}
              {couponStatus === "invalid" && (
                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                  <XCircle className="w-3 h-3" /> Invalid coupon code
                </p>
              )}
            </div>

            <div className="mt-2 p-4 bg-muted/30 rounded-lg border space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Base price ({passengersCount || 1}×)</span>
                <span>${basePrice.toFixed(2)}</span>
              </div>
              {markup > 0 && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Service fee</span>
                  <span>+${markup.toFixed(2)}</span>
                </div>
              )}
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Coupon discount</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t">
                <div>
                  <p className="text-xs text-muted-foreground">Total Price</p>
                  <p className="text-2xl font-bold text-primary">${finalPrice.toFixed(2)}</p>
                </div>
                <Button
                  type="button"
                  size="lg"
                  onClick={handlePayment}
                  disabled={createBooking.isPending}
                >
                  {createBooking.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                  ) : (
                    "Pay Now"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
