import { useState } from "react";
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
import { Loader2 } from "lucide-react";

const handlePayment = () => {
  const options = {
    key: "rzp_test_xxxxx",
    amount: totalPrice * 100,
    currency: "INR",
    name: "DreamFly",
    description: "Booking Payment",
    handler: function () {
      alert("Payment Successful");
    },
  };

  const rzp = new (window as any).Razorpay(options);
  rzp.open();
};

const formSchema = z.object({
  passengerName: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  passengerEmail: z.string().email({
    message: "Please enter a valid email address.",
  }),
  passengerPhone: z.string().min(10, {
    message: "Phone number must be at least 10 digits.",
  }),
  passengers: z.number().min(1).max(10),
  travelDate: z.string().min(1, "Date is required"),
});

type BookingFormProps = {
  bookingType: "flight" | "bus" | "hotel" | "package";
  referenceId: number;
  pricePerUnit: number;
  title: string;
};

export function BookingForm({
  bookingType,
  referenceId,
  pricePerUnit,
  title,
}: BookingFormProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createBooking = useCreateBooking();

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
  const totalPrice = pricePerUnit * (passengersCount || 1);

  function onSubmit(values: z.infer<typeof formSchema>) {
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
          toast({
            title: "Booking Confirmed!",
            description: "Your booking has been successfully created.",
          });
          setLocation(`/bookings/${data.id}`);
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Booking Failed",
            description:
              "There was an error creating your booking. Please try again.",
          });
        },
      },
    );
  }

  return (
    <Card className="w-full shadow-lg border-primary/10">
      <CardHeader className="bg-muted/50 border-b">
        <CardTitle className="text-xl">Book {title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="passengerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
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
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        {...field}
                      />
                    </FormControl>
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
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        {...field}
                      />
                    </FormControl>
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
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 1)
                        }
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
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="mt-6 p-4 bg-muted/30 rounded-lg flex justify-between items-center border">
              <div>
                <p className="text-sm text-muted-foreground">Total Price</p>
                <p className="text-2xl font-bold text-primary">
                  ${totalPrice.toFixed(2)}
                </p>
              </div>
              <Button size="lg" onClick={handlePayment}>
                Pay Now
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
