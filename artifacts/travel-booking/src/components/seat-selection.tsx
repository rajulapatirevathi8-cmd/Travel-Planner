import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Armchair, X } from "lucide-react";

type SeatSelectionProps = {
  type: "flight" | "bus" | "hotel";
  maxSeats: number;
  selectedSeats: string[];
  onSeatsChange: (seats: string[]) => void;
  pricePerSeat?: number;
  passengerGenders?: Array<"male" | "female" | "other" | undefined>;
};

export function SeatSelection({ 
  type, 
  maxSeats, 
  selectedSeats, 
  onSeatsChange,
  pricePerSeat,
  passengerGenders = []
}: SeatSelectionProps) {
  
  // Get gender-based color for a seat
  const getSeatGenderColor = (seatId: string) => {
    const seatIndex = selectedSeats.indexOf(seatId);
    if (seatIndex === -1) return null;
    
    const gender = passengerGenders[seatIndex];
    if (gender === "male") {
      return "border-blue-500 bg-blue-500 text-white hover:bg-blue-600";
    } else if (gender === "female") {
      return "border-pink-500 bg-pink-500 text-white hover:bg-pink-600";
    } else if (gender === "other") {
      return "border-purple-500 bg-purple-500 text-white hover:bg-purple-600";
    }
    return "border-primary bg-primary text-primary-foreground hover:bg-primary/90";
  };
  
  // Generate seat layout based on type
  const getSeatLayout = () => {
    if (type === "flight") {
      // 6 seats per row (A-F), 10 rows
      const rows = 10;
      const columns = ["A", "B", "C", "D", "E", "F"];
      return { rows, columns };
    } else if (type === "bus") {
      // 4 seats per row (A-D), 12 rows
      const rows = 12;
      const columns = ["A", "B", "C", "D"];
      return { rows, columns };
    } else {
      // Hotel - room selection (different UI)
      const rooms = 10;
      return { rooms };
    }
  };

  const layout = getSeatLayout();

  // Generate random occupied seats for demo
  const [occupiedSeats] = useState(() => {
    if (type === "hotel") return [];
    
    const occupied = new Set<string>();
    const totalSeats = type === "flight" ? 60 : 48;
    const occupiedCount = Math.floor(totalSeats * 0.3); // 30% occupied
    
    while (occupied.size < occupiedCount) {
      const row = Math.floor(Math.random() * (layout as any).rows) + 1;
      const col = (layout as any).columns[Math.floor(Math.random() * (layout as any).columns.length)];
      occupied.add(`${row}${col}`);
    }
    
    return Array.from(occupied);
  });
  const handleSeatClick = (seatId: string, event?: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent form submission
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    if (occupiedSeats.includes(seatId)) return;

    const isSelected = selectedSeats.includes(seatId);
    
    if (isSelected) {
      // Deselect
      onSeatsChange(selectedSeats.filter(s => s !== seatId));
    } else {
      // Select (check max limit)
      if (selectedSeats.length < maxSeats) {
        onSeatsChange([...selectedSeats, seatId]);
      }
    }
  };

  const getSeatStatus = (seatId: string) => {
    if (occupiedSeats.includes(seatId)) return "occupied";
    if (selectedSeats.includes(seatId)) return "selected";
    return "available";
  };

  const renderFlightOrBusSeats = () => {
    const { rows, columns } = layout as { rows: number; columns: string[] };
    
    return (
      <div className="space-y-4">        {/* Legend */}
        <div className="flex flex-wrap gap-4 justify-center text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded border-2 border-green-500 bg-green-50"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded border-2 border-blue-500 bg-blue-500"></div>
            <span>Male</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded border-2 border-pink-500 bg-pink-500"></div>
            <span>Female</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded border-2 border-purple-500 bg-purple-500"></div>
            <span>Other</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded border-2 border-muted bg-muted"></div>
            <span>Occupied</span>
          </div>
        </div>

        {/* Seat Grid */}
        <div className="max-w-md mx-auto">
          {/* Front indicator */}
          <div className="text-center mb-4 pb-2 border-b-2 border-primary">
            <span className="text-sm font-semibold text-primary">
              {type === "flight" ? "✈ FRONT" : "🚌 DRIVER"}
            </span>
          </div>

          <div className="space-y-2">
            {Array.from({ length: rows }, (_, rowIndex) => {
              const rowNum = rowIndex + 1;
              return (
                <div key={rowNum} className="flex items-center justify-center gap-2">                  {/* Left side seats */}
                  <div className="flex gap-1">
                    {columns.slice(0, Math.ceil(columns.length / 2)).map((col) => {
                      const seatId = `${rowNum}${col}`;
                      const status = getSeatStatus(seatId);
                      
                      return (
                        <button
                          key={seatId}
                          type="button"
                          onClick={(e) => handleSeatClick(seatId, e)}
                          disabled={status === "occupied"}
                          className={cn(
                            "w-8 h-8 rounded text-xs font-semibold transition-all",
                            "border-2 flex items-center justify-center",
                            status === "available" && "border-green-500 bg-green-50 hover:bg-green-100",
                            status === "selected" && getSeatGenderColor(seatId),
                            status === "occupied" && "border-muted bg-muted text-muted-foreground cursor-not-allowed"
                          )}
                        >
                          {status === "occupied" ? <X className="w-3 h-3" /> : seatId}
                        </button>
                      );
                    })}
                  </div>

                  {/* Row number */}
                  <span className="w-6 text-center text-xs font-semibold text-muted-foreground">
                    {rowNum}
                  </span>

                  {/* Right side seats */}
                  <div className="flex gap-1">
                    {columns.slice(Math.ceil(columns.length / 2)).map((col) => {
                      const seatId = `${rowNum}${col}`;
                      const status = getSeatStatus(seatId);
                      
                      return (
                        <button
                          key={seatId}
                          type="button"
                          onClick={(e) => handleSeatClick(seatId, e)}
                          disabled={status === "occupied"}
                          className={cn(
                            "w-8 h-8 rounded text-xs font-semibold transition-all",
                            "border-2 flex items-center justify-center",
                            status === "available" && "border-green-500 bg-green-50 hover:bg-green-100",
                            status === "selected" && getSeatGenderColor(seatId),
                            status === "occupied" && "border-muted bg-muted text-muted-foreground cursor-not-allowed"
                          )}
                        >
                          {status === "occupied" ? <X className="w-3 h-3" /> : seatId}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderHotelRooms = () => {
    const { rooms } = layout as { rooms: number };
    
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground text-center">
          Select up to {maxSeats} room{maxSeats > 1 ? 's' : ''}
        </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Array.from({ length: rooms }, (_, i) => {
            const roomId = `Room ${101 + i}`;
            const isSelected = selectedSeats.includes(roomId);
            
            return (
              <button
                key={roomId}
                type="button"
                onClick={(e) => handleSeatClick(roomId, e)}
                className={cn(
                  "p-4 rounded-lg border-2 transition-all",
                  "flex flex-col items-center gap-2",
                  isSelected 
                    ? "border-primary bg-primary text-primary-foreground" 
                    : "border-border bg-card hover:border-primary/50"
                )}
              >
                <Armchair className="w-6 h-6" />
                <span className="font-semibold text-sm">{roomId}</span>
                {pricePerSeat && (
                  <span className="text-xs">₹{pricePerSeat}/night</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{type === "hotel" ? "Select Rooms" : "Select Your Seats"}</span>
          <Badge variant="secondary">
            {selectedSeats.length}/{maxSeats} selected
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {type === "hotel" ? renderHotelRooms() : renderFlightOrBusSeats()}
        
        {selectedSeats.length > 0 && (
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold mb-2">
              {type === "hotel" ? "Selected Rooms:" : "Selected Seats:"}
            </h4>            <div className="flex flex-wrap gap-2">
              {selectedSeats.map((seat) => (
                <Badge key={seat} variant="default" className="gap-1">
                  {seat}
                  <button
                    type="button"
                    onClick={(e) => handleSeatClick(seat, e)}
                    className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
