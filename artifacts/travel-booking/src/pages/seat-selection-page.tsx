import { useState, useEffect } from "react";
import { useLocation, useParams, useSearch } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SeatSelection } from "@/components/seat-selection";
import { HotelRoomSelection } from "@/components/hotel-room-selection";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Users } from "lucide-react";
import { Link } from "wouter";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type BookingType = "flight" | "bus" | "hotel";

// Mock room data - In a real app, this would come from API
const HOTEL_ROOMS = [
  {
    id: "standard",
    name: "Standard Room",
    description: "Comfortable room with essential amenities for a pleasant stay",
    capacity: 2,
    beds: "1 Queen Bed",
    size: "25 m²",
    amenities: ["WiFi", "TV", "Air Conditioning", "Private Bathroom", "Coffee Maker"],
    pricePerNight: 2500,
    available: 8,
    images: ["https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600&h=400&fit=crop&q=80"],
    cancellation: "Free cancellation up to 24 hours before check-in"
  },
  {
    id: "deluxe",
    name: "Deluxe Room",
    description: "Spacious room with city views and modern amenities",
    capacity: 2,
    beds: "1 King Bed",
    size: "32 m²",
    amenities: ["WiFi", "TV", "Air Conditioning", "Private Bathroom", "Coffee Maker", "Mini Bar", "Room Service"],
    pricePerNight: 3500,
    available: 5,
    images: ["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop&q=80"],
    cancellation: "Free cancellation up to 24 hours before check-in"
  },
  {
    id: "family",
    name: "Family Room",
    description: "Perfect for families with connecting rooms and extra space",
    capacity: 4,
    beds: "2 Queen Beds",
    size: "45 m²",
    amenities: ["WiFi", "TV", "Air Conditioning", "Private Bathroom", "Coffee Maker", "Mini Bar", "Room Service", "Kids' Amenities"],
    pricePerNight: 5200,
    available: 4,
    images: ["https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&h=400&fit=crop&q=80"],
    cancellation: "Free cancellation up to 24 hours before check-in"
  },
  {
    id: "suite",
    name: "Executive Suite",
    description: "Luxurious suite with separate living area and premium facilities",
    capacity: 3,
    beds: "1 King Bed + 1 Sofa Bed",
    size: "55 m²",
    amenities: ["WiFi", "TV", "Air Conditioning", "Private Bathroom", "Coffee Maker", "Mini Bar", "Room Service", "Balcony", "Work Desk"],
    pricePerNight: 6750,
    available: 3,
    images: ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop&q=80"],
    cancellation: "Free cancellation up to 48 hours before check-in"
  }
];

export default function SeatSelectionPage() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const searchParams = useSearch();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [passengersCount, setPassengersCount] = useState(1);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [travelDate, setTravelDate] = useState(new Date().toISOString().split("T")[0]);

  // Get booking details from search params
  const price = parseFloat(new URLSearchParams(searchParams).get("price") || "0");
  const title = new URLSearchParams(searchParams).get("title") || "";

  const isHotel = type === "hotel";

  useEffect(() => {
    // Validate booking type
    if (!["flight", "bus", "hotel"].includes(type || "")) {
      toast({
        variant: "destructive",
        title: "Invalid Booking Type",
        description: "Please select a valid booking option.",
      });
      setLocation("/");
    }
  }, [type, setLocation, toast]);

  const handleHotelRoomsSelected = (selectedRooms: { roomType: string; count: number; roomIds: string[] }[]) => {
    // Flatten room IDs
    const allRoomIds = selectedRooms.flatMap(room => room.roomIds);
    const totalRooms = selectedRooms.reduce((sum, room) => sum + room.count, 0);
    
    // Calculate total price
    const totalPrice = selectedRooms.reduce((sum, room) => {
      const roomData = HOTEL_ROOMS.find(r => r.name === room.roomType);
      return sum + (roomData?.pricePerNight || 0) * room.count;
    }, 0);

    // Navigate to passenger details page
    const params = new URLSearchParams({
      type: type || "",
      id: id || "",
      price: (totalPrice / totalRooms).toString(), // Average price per room
      title: title,
      passengers: totalRooms.toString(), // Number of rooms = number of "passengers" (guests)
      seats: allRoomIds.join(","),
      date: travelDate,
    });
    
    setLocation(`/booking/passenger-details?${params.toString()}`);
  };

  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      toast({
        variant: "destructive",
        title: "No Seats Selected",
        description: "Please select at least one seat to continue.",
      });
      return;
    }

    if (selectedSeats.length !== passengersCount) {
      toast({
        variant: "destructive",
        title: "Seat Mismatch",
        description: `Please select exactly ${passengersCount} seat(s) for ${passengersCount} passenger(s).`,
      });
      return;
    }

    // Navigate to passenger details page with selected seats
    const params = new URLSearchParams({
      type: type || "",
      id: id || "",
      price: price.toString(),
      title: title,
      passengers: passengersCount.toString(),
      seats: selectedSeats.join(","),
      date: travelDate,
    });
    
    setLocation(`/booking/passenger-details?${params.toString()}`);
  };

  const handleBack = () => {
    // Navigate back to the detail page
    const detailPageMap: Record<string, string> = {
      flight: `/flights/${id}`,
      bus: `/buses/${id}`,
      hotel: `/hotels/${id}`,
    };
    
    setLocation(detailPageMap[type || "flight"] || "/");
  };
  return (
    <Layout>
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 py-6">
          <Button variant="ghost" onClick={handleBack} className="mb-4 pl-0 hover:bg-transparent">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Details
          </Button>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold flex items-center gap-3">
                {isHotel ? "Select Your Rooms" : "Select Your Seats"}
              </h1>
              <p className="text-muted-foreground mt-2">{title}</p>
            </div>
            {!isHotel && (
              <div className="text-left md:text-right">
                <p className="text-sm text-muted-foreground font-medium mb-1">Price per passenger</p>
                <p className="text-3xl font-extrabold text-primary">₹{price}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {isHotel ? (
          /* Hotel Room Selection */
          <HotelRoomSelection
            hotelName={title}
            rooms={HOTEL_ROOMS}
            onRoomsSelected={handleHotelRoomsSelected}
          />
        ) : (
          /* Flight/Bus Seat Selection */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Seat Selection Area */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Choose Your Seats</CardTitle>
                  <CardDescription>
                    Select {passengersCount} seat(s) for your journey. Seats will be color-coded based on passenger gender in the next step.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SeatSelection
                    type={type as BookingType}
                    maxSeats={passengersCount}
                    selectedSeats={selectedSeats}
                    onSeatsChange={setSelectedSeats}
                    passengerGenders={[]}
                  />
                  
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <h3 className="font-semibold mb-2">Legend</h3>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 border-2 rounded bg-background"></div>
                        <span>Available</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 border-2 rounded bg-primary text-primary-foreground"></div>
                        <span>Selected</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 border-2 rounded bg-muted text-muted-foreground"></div>
                        <span>Occupied</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Booking Summary Sidebar */}
            <div>
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Number of Passengers */}
                  <div>
                    <Label htmlFor="passengers" className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4" />
                      Number of Passengers
                    </Label>
                    <Input
                      id="passengers"
                      type="number"
                      min={1}
                      max={10}
                      value={passengersCount}
                      onChange={(e) => {
                        const count = parseInt(e.target.value, 10);
                        if (count >= 1 && count <= 10) {
                          setPassengersCount(count);
                          // Clear seats if count changes
                          setSelectedSeats([]);
                        }
                      }}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Maximum 10 passengers per booking
                    </p>
                  </div>

                  {/* Travel Date */}
                  <div>
                    <Label htmlFor="travelDate">Travel Date</Label>
                    <Input
                      id="travelDate"
                      type="date"
                      value={travelDate}
                      onChange={(e) => setTravelDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full"
                    />
                  </div>

                  {/* Selected Seats */}
                  <div>
                    <h3 className="font-semibold mb-2">Selected Seats</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedSeats.length > 0 ? (
                        selectedSeats.map((seat) => (
                          <span
                            key={seat}
                            className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm font-medium"
                          >
                            {seat}
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No seats selected yet</p>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {selectedSeats.length} of {passengersCount} seat(s) selected
                    </p>
                  </div>

                  {/* Price Breakdown */}
                  <div className="pt-4 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Base Price (per person)</span>
                      <span>₹{price}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Number of Passengers</span>
                      <span>×{passengersCount}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Subtotal</span>
                      <span className="text-primary">₹{price * passengersCount}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Final price will be calculated after coupon/discount in the next step
                    </p>
                  </div>

                  {/* Continue Button */}
                  <Button 
                    onClick={handleContinue}
                    disabled={selectedSeats.length !== passengersCount}
                    className="w-full"
                    size="lg"
                  >
                    Continue to Passenger Details
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
