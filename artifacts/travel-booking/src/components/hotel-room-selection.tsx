import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  BedDouble, 
  Users, 
  Wifi, 
  Coffee, 
  Tv, 
  Bath, 
  Wind,
  CheckCircle2,
  Plus,
  Minus,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RoomType {
  id: string;
  name: string;
  description: string;
  capacity: number;
  beds: string;
  size: string;
  amenities: string[];
  pricePerNight: number;
  available: number;
  images: string[];
  cancellation: string;
}

interface HotelRoomSelectionProps {
  hotelName: string;
  rooms: RoomType[];
  onRoomsSelected: (selectedRooms: { roomType: string; count: number; roomIds: string[] }[]) => void;
}

const amenityIcons: Record<string, any> = {
  "WiFi": Wifi,
  "TV": Tv,
  "Coffee Maker": Coffee,
  "Air Conditioning": Wind,
  "Private Bathroom": Bath,
};

export function HotelRoomSelection({ hotelName, rooms, onRoomsSelected }: HotelRoomSelectionProps) {
  const [selectedRooms, setSelectedRooms] = useState<Record<string, number>>({});

  const handleRoomCountChange = (roomId: string, delta: number) => {
    setSelectedRooms(prev => {
      const current = prev[roomId] || 0;
      const newCount = Math.max(0, Math.min(current + delta, rooms.find(r => r.id === roomId)?.available || 0));
      
      if (newCount === 0) {
        const { [roomId]: _, ...rest } = prev;
        return rest;
      }
      
      return {
        ...prev,
        [roomId]: newCount
      };
    });
  };

  const getTotalRooms = () => {
    return Object.values(selectedRooms).reduce((sum, count) => sum + count, 0);
  };

  const getTotalPrice = () => {
    return Object.entries(selectedRooms).reduce((sum, [roomId, count]) => {
      const room = rooms.find(r => r.id === roomId);
      return sum + (room?.pricePerNight || 0) * count;
    }, 0);
  };

  const handleContinue = () => {
    // Generate room IDs for each selected room
    const roomSelections = Object.entries(selectedRooms).map(([roomId, count]) => {
      const room = rooms.find(r => r.id === roomId);
      const roomIds = Array.from({ length: count }, (_, i) => `${room?.name}-${i + 1}`);
      
      return {
        roomType: room?.name || roomId,
        count,
        roomIds
      };
    });

    onRoomsSelected(roomSelections);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Info className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">Select Your Rooms</h3>
              <p className="text-muted-foreground">
                Choose from our available room types. You can select multiple rooms for group bookings.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Room Type Cards */}
      <div className="space-y-6">
        {rooms.map((room) => (
          <Card 
            key={room.id} 
            className={cn(
              "overflow-hidden transition-all hover:shadow-lg border-2",
              selectedRooms[room.id] > 0 
                ? "border-primary shadow-md bg-primary/5" 
                : "border-border"
            )}
          >
            <div className="md:flex">
              {/* Room Image */}
              <div className="md:w-2/5 relative">
                <img
                  src={room.images[0] || "https://placehold.co/600x400/e2e8f0/64748b"}
                  alt={room.name}
                  className="w-full h-64 md:h-full object-cover"
                />
                {room.available < 5 && (
                  <Badge className="absolute top-3 left-3 bg-destructive">
                    Only {room.available} left!
                  </Badge>
                )}
                {selectedRooms[room.id] > 0 && (
                  <Badge className="absolute top-3 right-3 bg-primary">
                    {selectedRooms[room.id]} Selected
                  </Badge>
                )}
              </div>

              {/* Room Details */}
              <div className="md:w-3/5 p-6 flex flex-col">
                <div className="flex-1">
                  {/* Room Title */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-2xl font-bold mb-1">{room.name}</h3>
                      <p className="text-muted-foreground">{room.description}</p>
                    </div>
                  </div>

                  {/* Room Info */}
                  <div className="flex flex-wrap gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-2">
                      <BedDouble className="w-4 h-4 text-primary" />
                      <span>{room.beds}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" />
                      <span>Up to {room.capacity} guests</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span>{room.size}</span>
                    </div>
                  </div>                  {/* Amenities */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {room.amenities.slice(0, 5).map((amenity, idx) => {
                        const Icon = amenityIcons[amenity] || CheckCircle2;
                        return (
                          <div 
                            key={idx} 
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 rounded-full text-xs"
                          >
                            <Icon className="w-3 h-3 text-primary" />
                            <span>{amenity}</span>
                          </div>
                        );
                      })}
                      {room.amenities.length > 5 && (
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="flex items-center px-3 py-1.5 text-xs text-primary hover:text-primary/80 hover:bg-primary/5 rounded-full transition-colors">
                              +{room.amenities.length - 5} more
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80" align="start">
                            <div className="space-y-2">
                              <h4 className="font-semibold text-sm">All Amenities</h4>
                              <div className="grid grid-cols-1 gap-2">
                                {room.amenities.map((amenity, idx) => {
                                  const Icon = amenityIcons[amenity] || CheckCircle2;
                                  return (
                                    <div key={idx} className="flex items-center gap-2 text-sm">
                                      <Icon className="w-4 h-4 text-primary shrink-0" />
                                      <span>{amenity}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>
                  </div>

                  {/* Cancellation Policy */}
                  <div className="flex items-start gap-2 mb-4 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                    <div className="text-xs">
                      <p className="font-semibold text-green-700 dark:text-green-400">
                        {room.cancellation}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Price and Selection */}
                <div className="border-t pt-4 mt-auto">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-primary">
                        ₹{room.pricePerNight.toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground">per room / night</p>
                    </div>

                    {selectedRooms[room.id] > 0 ? (
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleRoomCountChange(room.id, -1)}
                          className="h-10 w-10 rounded-full"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <div className="text-2xl font-bold min-w-[2ch] text-center">
                          {selectedRooms[room.id]}
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleRoomCountChange(room.id, 1)}
                          disabled={selectedRooms[room.id] >= room.available}
                          className="h-10 w-10 rounded-full"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleRoomCountChange(room.id, 1)}
                        size="lg"
                        className="px-8"
                      >
                        Select Room
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Sticky Bottom Bar */}
      {getTotalRooms() > 0 && (
        <Card className="sticky bottom-4 shadow-2xl border-2 border-primary bg-background">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground mb-1">
                  {getTotalRooms()} room{getTotalRooms() > 1 ? 's' : ''} selected
                </div>
                <div className="text-3xl font-bold text-primary">
                  ₹{getTotalPrice().toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Total for 1 night</p>
              </div>
              <Button 
                size="lg" 
                onClick={handleContinue}
                className="px-12"
              >
                Continue to Guest Details
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
