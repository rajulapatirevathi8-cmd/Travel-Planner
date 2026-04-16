import { useState, useMemo } from "react";
import { useLocation, useSearch } from "wouter";
import { getHiddenMarkupAmount } from "@/lib/pricing";
import { generateBusSeats, getBusLayoutType } from "@/lib/bus-seats";
import type { BusSeat } from "@/lib/bus-seats";
import { MOCK_BUSES } from "@/pages/bus-results";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bus,
  ArrowLeft,
  ArrowRight,
  MapPin,
  Clock,
  Calendar,
  ChevronRight,
  Info,
  Users,
  BedDouble,
  Armchair,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// ── Helpers ───────────────────────────────────────────────────────────────────

function seatDisplayLabel(seat: BusSeat, layoutType: "sleeper" | "seater"): string {
  if (layoutType === "sleeper" && seat.berth) {
    return `${seat.label} (${seat.berth === "lower" ? "L" : "U"})`;
  }
  return seat.label;
}

// ── Seater Seat Button ────────────────────────────────────────────────────────
function SeaterSeatBtn({
  seat,
  selected,
  onToggle,
}: {
  seat: BusSeat;
  selected: boolean;
  onToggle: (id: string) => void;
}) {
  const isBooked = seat.status === "booked";
  const isFemale = seat.gender === "F";

  return (
    <button
      onClick={() => !isBooked && onToggle(seat.id)}
      disabled={isBooked}
      title={
        isBooked
          ? `${seat.label} — ${isFemale ? "Female" : "Male"} Booked`
          : `Seat ${seat.label}`
      }
      className={cn(
        "w-9 h-9 rounded-md border-2 text-[9px] font-bold transition-all",
        isBooked && isFemale
          ? "bg-pink-100 border-pink-300 text-pink-500 cursor-not-allowed"
          : isBooked
          ? "bg-slate-200 border-slate-200 text-slate-400 cursor-not-allowed"
          : selected
          ? "bg-orange-100 border-orange-400 text-orange-700 shadow-sm scale-105"
          : "bg-white border-slate-300 text-slate-600 hover:border-orange-300 hover:bg-orange-50 cursor-pointer",
      )}
    >
      {seat.label}
    </button>
  );
}

// ── Sleeper Berth Button ──────────────────────────────────────────────────────
function SleeperBerthBtn({
  seat,
  selected,
  onToggle,
}: {
  seat: BusSeat;
  selected: boolean;
  onToggle: (id: string) => void;
}) {
  const isBooked = seat.status === "booked";
  const isFemale = seat.gender === "F";

  return (
    <button
      onClick={() => !isBooked && onToggle(seat.id)}
      disabled={isBooked}
      title={
        isBooked
          ? `${seat.label} ${seat.berth} — ${isFemale ? "Female" : "Male"} Booked`
          : `${seat.label} ${seat.berth} berth`
      }
      className={cn(
        "w-16 h-10 rounded-md border-2 text-[9px] font-bold transition-all flex flex-col items-center justify-center gap-0.5",
        isBooked && isFemale
          ? "bg-pink-100 border-pink-300 text-pink-500 cursor-not-allowed"
          : isBooked
          ? "bg-slate-200 border-slate-200 text-slate-400 cursor-not-allowed"
          : selected
          ? "bg-orange-100 border-orange-400 text-orange-700 shadow-sm scale-105"
          : "bg-white border-slate-300 text-slate-600 hover:border-orange-300 hover:bg-orange-50 cursor-pointer",
      )}
    >
      <span className="text-[8px] leading-none">{seat.label}</span>
      <span className="text-[7px] leading-none opacity-70 capitalize">{seat.berth}</span>
    </button>
  );
}

// ── Seater Grid ───────────────────────────────────────────────────────────────
function SeaterGrid({
  seats,
  selectedIds,
  onToggle,
}: {
  seats: BusSeat[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}) {
  const rows = Array.from(new Set(seats.map((s) => s.row))).sort((a, b) => a - b);

  return (
    <div className="inline-block border-2 border-slate-200 rounded-2xl p-4 bg-slate-50">
      {/* Driver */}
      <div className="flex justify-end mb-4 pr-1">
        <div className="w-10 h-10 rounded-xl bg-slate-300 flex items-center justify-center text-xs font-bold text-slate-600">
          🚌
        </div>
      </div>

      {/* Col headers */}
      <div className="flex gap-1.5 mb-2 px-0.5">
        <div className="w-9 text-[10px] text-center text-muted-foreground font-bold">A</div>
        <div className="w-9 text-[10px] text-center text-muted-foreground font-bold">B</div>
        <div className="w-5" />
        <div className="w-9 text-[10px] text-center text-muted-foreground font-bold">C</div>
        <div className="w-9 text-[10px] text-center text-muted-foreground font-bold">D</div>
      </div>

      <div className="space-y-1.5">
        {rows.map((row) => {
          const rowSeats = seats.filter((s) => s.row === row);
          const left  = rowSeats.filter((s) => s.side === "left");
          const right = rowSeats.filter((s) => s.side === "right");
          return (
            <div key={row} className="flex items-center gap-1.5">
              {/* Left (A, B) */}
              {left.map((seat) => (
                <SeaterSeatBtn
                  key={seat.id}
                  seat={seat}
                  selected={selectedIds.includes(seat.id)}
                  onToggle={onToggle}
                />
              ))}
              {/* Pad if row has fewer left seats */}
              {left.length < 2 &&
                Array.from({ length: 2 - left.length }).map((_, i) => (
                  <div key={i} className="w-9 h-9" />
                ))}

              {/* Aisle + row number */}
              <div className="w-5 flex items-center justify-center">
                <span className="text-[9px] text-slate-300 font-bold">{row}</span>
              </div>

              {/* Right (C, D) */}
              {right.map((seat) => (
                <SeaterSeatBtn
                  key={seat.id}
                  seat={seat}
                  selected={selectedIds.includes(seat.id)}
                  onToggle={onToggle}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Sleeper Grid (single deck: lower OR upper) ────────────────────────────────
function SleeperDeckGrid({
  seats,
  selectedIds,
  onToggle,
}: {
  seats: BusSeat[];       // already filtered to one berth level
  selectedIds: string[];
  onToggle: (id: string) => void;
}) {
  const rows = Array.from(new Set(seats.map((s) => s.row))).sort((a, b) => a - b);

  return (
    <div className="inline-block border-2 border-slate-200 rounded-2xl p-4 bg-slate-50">
      {/* col headers */}
      <div className="flex gap-2 mb-2 px-0.5">
        <div className="w-16 text-[10px] text-center text-muted-foreground font-bold">A</div>
        <div className="w-16 text-[10px] text-center text-muted-foreground font-bold">B</div>
        <div className="w-5" />
        <div className="w-16 text-[10px] text-center text-muted-foreground font-bold">C</div>
      </div>

      <div className="space-y-2">
        {rows.map((row) => {
          const rowSeats = seats.filter((s) => s.row === row);
          const left  = rowSeats.filter((s) => s.side === "left");
          const right = rowSeats.filter((s) => s.side === "right");
          return (
            <div key={row} className="flex items-center gap-2">
              {left.map((seat) => (
                <SleeperBerthBtn
                  key={seat.id}
                  seat={seat}
                  selected={selectedIds.includes(seat.id)}
                  onToggle={onToggle}
                />
              ))}
              {left.length < 2 &&
                Array.from({ length: 2 - left.length }).map((_, i) => (
                  <div key={i} className="w-16 h-10" />
                ))}

              <div className="w-5 flex items-center justify-center">
                <span className="text-[9px] text-slate-300 font-bold">{row}</span>
              </div>

              {right.map((seat) => (
                <SleeperBerthBtn
                  key={seat.id}
                  seat={seat}
                  selected={selectedIds.includes(seat.id)}
                  onToggle={onToggle}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function BusSeatSelection() {
  const searchString = useSearch();
  const [, setLocation] = useLocation();
  const p = new URLSearchParams(searchString);

  const busId          = parseInt(p.get("busId") || "1");
  const busName        = p.get("busName")       || "Bus";
  const operator       = p.get("operator")      || busName;
  const from           = p.get("from")          || "";
  const to             = p.get("to")            || "";
  const departure      = p.get("departure")     || "";
  const arrival        = p.get("arrival")       || "";
  const duration       = p.get("duration")      || "";
  const date           = p.get("date")          || "";
  const rawPrice       = parseInt(p.get("price")            || "0");
  const markupAmt      = parseInt(p.get("markup")           || "0");
  const priceWithMarkup = parseInt(p.get("priceWithMarkup") || "0");
  const normalMarkup   = parseInt(p.get("normalMarkup")     || "0");
  const agentSavings   = parseInt(p.get("agentSavings")     || "0");
  const busType        = p.get("busType")       || "";
  const totalSeats     = parseInt(p.get("totalSeats")       || "40");
  const seatsAvailable = parseInt(p.get("seatsAvailable")   || "20");
  const boardingPoints = (p.get("boardingPoints") || "").split("|").filter(Boolean);
  const droppingPoints = (p.get("droppingPoints") || "").split("|").filter(Boolean);

  const effectivePrice = priceWithMarkup > 0 ? priceWithMarkup : rawPrice + markupAmt;

  // ── Fetch seat data from API (MOCK_BUSES) ───────────────────────────────────
  const bus = useMemo(() => MOCK_BUSES.find((b) => b.id === busId), [busId]);

  const seats = useMemo(
    () => generateBusSeats(
      busId,
      bus?.busType ?? busType,
      bus?.totalSeats ?? totalSeats,
      bus?.seatsAvailable ?? seatsAvailable,
    ),
    [busId, bus, busType, totalSeats, seatsAvailable],
  );

  const layoutType = getBusLayoutType(bus?.busType ?? busType);

  // For sleeper: separate lower and upper berths
  const lowerBerths = useMemo(
    () => seats.filter((s) => s.berth === "lower"),
    [seats],
  );
  const upperBerths = useMemo(
    () => seats.filter((s) => s.berth === "upper"),
    [seats],
  );

  // ── State ───────────────────────────────────────────────────────────────────
  const [selectedIds, setSelectedIds]   = useState<string[]>([]);
  const [activeDeck, setActiveDeck]     = useState<"lower" | "upper">("lower");
  const [boardingPoint, setBoardingPoint] = useState("");
  const [droppingPoint, setDroppingPoint] = useState("");
  const [boardingErr, setBoardingErr]   = useState(false);
  const [droppingErr, setDroppingErr]   = useState(false);

  function toggleSeat(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  }

  const selectedSeats = useMemo(
    () => seats.filter((s) => selectedIds.includes(s.id)),
    [seats, selectedIds],
  );

  const availableCount = seats.filter((s) => s.status === "available").length;

  // ── Proceed ─────────────────────────────────────────────────────────────────
  function handleProceed() {
    let hasErr = false;
    if (!boardingPoint) { setBoardingErr(true);  hasErr = true; } else setBoardingErr(false);
    if (!droppingPoint) { setDroppingErr(true);  hasErr = true; } else setDroppingErr(false);
    if (selectedIds.length === 0 || hasErr) return;

    const bookParams = new URLSearchParams({
      busId:           String(busId),
      busName,
      operator,
      from,
      to,
      departure,
      arrival,
      duration,
      date,
      price:           String(rawPrice),
      markup:          String(markupAmt),
      priceWithMarkup: String(effectivePrice),
      normalMarkup:    String(normalMarkup),
      agentSavings:    String(agentSavings),
      busType:         bus?.busType ?? busType,
      seats:           selectedIds.join(","),
      boardingPoint,
      droppingPoint,
    });
    setLocation(`/bus/booking?${bookParams.toString()}`);
  }

  const totalAmount = effectivePrice * selectedIds.length;

  // ── Legend ──────────────────────────────────────────────────────────────────
  const Legend = () => (
    <div className="flex flex-wrap items-center gap-3 mb-5 text-xs text-slate-600">
      <div className="flex items-center gap-1.5">
        <div className="w-7 h-7 rounded-md border-2 border-slate-200 bg-white" />
        <span>Available</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-7 h-7 rounded-md border-2 border-orange-400 bg-orange-100" />
        <span>Selected</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-7 h-7 rounded-md border-2 border-slate-200 bg-slate-200" />
        <span>Booked (M)</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-7 h-7 rounded-md border-2 border-pink-300 bg-pink-100" />
        <span>Booked (F)</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 h-[60px] flex items-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="w-px h-6 bg-border shrink-0" />
          <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-100 rounded-lg px-3 py-1.5">
            <Bus className="w-3.5 h-3.5 text-orange-600 shrink-0" />
            <span className="font-bold text-sm text-orange-900">{from}</span>
            <ArrowRight className="w-3 h-3 text-orange-400" />
            <span className="font-bold text-sm text-orange-900">{to}</span>
          </div>
          {date && (
            <div className="flex items-center gap-1.5 bg-muted/60 border rounded-lg px-3 py-1.5 hidden sm:flex">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-sm font-medium">{date}</span>
            </div>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Left: Bus Info + Seat Map */}
          <div className="flex-1 min-w-0 space-y-5">

            {/* Bus summary */}
            <Card className="shadow-sm border">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center shadow-sm shrink-0">
                    <Bus className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900">{busName}</p>
                    <p className="text-xs text-muted-foreground">{bus?.busType ?? busType}</p>
                  </div>
                  <Badge variant="outline" className="shrink-0 text-xs">{availableCount} seats left</Badge>
                </div>

                <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                  <div>
                    <p className="text-xl font-extrabold text-slate-900">{departure}</p>
                    <p className="text-xs font-semibold text-slate-500 flex items-center gap-0.5 mt-0.5">
                      <MapPin className="w-3 h-3" />{from}
                    </p>
                  </div>
                  <div className="flex-1 flex flex-col items-center">
                    <p className="text-[11px] text-muted-foreground mb-1">{duration}</p>
                    <div className="w-full flex items-center gap-1">
                      <div className="flex-1 h-px bg-slate-300" />
                      <Bus className="w-4 h-4 text-orange-400" />
                      <div className="flex-1 h-px bg-slate-300" />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-extrabold text-slate-900">{arrival}</p>
                    <p className="text-xs font-semibold text-slate-500 flex items-center gap-0.5 mt-0.5 justify-end">
                      <MapPin className="w-3 h-3" />{to}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seat Map */}
            <Card className="shadow-sm border">
              <CardContent className="p-5">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  {layoutType === "sleeper"
                    ? <BedDouble className="w-4 h-4 text-orange-600" />
                    : <Armchair   className="w-4 h-4 text-orange-600" />
                  }
                  {layoutType === "sleeper" ? "Select Your Berth(s)" : "Select Your Seat(s)"}
                </h3>

                <Legend />

                {/* ── SLEEPER: Lower / Upper deck tabs ── */}
                {layoutType === "sleeper" && (
                  <div>
                    {/* Deck toggle */}
                    <div className="flex items-center gap-2 mb-5">
                      <button
                        onClick={() => setActiveDeck("lower")}
                        className={cn(
                          "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border-2 transition-all",
                          activeDeck === "lower"
                            ? "bg-orange-500 border-orange-500 text-white shadow-sm"
                            : "bg-white border-slate-200 text-slate-600 hover:border-orange-300",
                        )}
                      >
                        <BedDouble className="w-3.5 h-3.5" /> Lower Berth
                        <span className="ml-1 text-[11px] font-normal opacity-80">
                          ({lowerBerths.filter((s) => s.status === "available").length} avail)
                        </span>
                      </button>
                      <button
                        onClick={() => setActiveDeck("upper")}
                        className={cn(
                          "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border-2 transition-all",
                          activeDeck === "upper"
                            ? "bg-orange-500 border-orange-500 text-white shadow-sm"
                            : "bg-white border-slate-200 text-slate-600 hover:border-orange-300",
                        )}
                      >
                        <BedDouble className="w-3.5 h-3.5" /> Upper Berth
                        <span className="ml-1 text-[11px] font-normal opacity-80">
                          ({upperBerths.filter((s) => s.status === "available").length} avail)
                        </span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                      <Info className="w-3.5 h-3.5" />
                      2+1 sleeper layout · Left side (A, B) + Right side (C) · {bus?.busType ?? busType}
                    </div>

                    <div className="overflow-x-auto">
                      <SleeperDeckGrid
                        seats={activeDeck === "lower" ? lowerBerths : upperBerths}
                        selectedIds={selectedIds}
                        onToggle={toggleSeat}
                      />
                    </div>
                  </div>
                )}

                {/* ── SEATER: 2+2 rows ── */}
                {layoutType === "seater" && (
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                      <Info className="w-3.5 h-3.5" />
                      2+2 seater layout · Left (A, B) + Right (C, D) · {bus?.busType ?? busType}
                    </div>
                    <div className="overflow-x-auto">
                      <SeaterGrid
                        seats={seats}
                        selectedIds={selectedIds}
                        onToggle={toggleSeat}
                      />
                    </div>
                  </div>
                )}

                {/* Selected summary */}
                {selectedIds.length > 0 && (
                  <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-xl text-sm">
                    <span className="font-semibold text-orange-800">Selected: </span>
                    <span className="text-orange-700">
                      {selectedSeats.map((s) => seatDisplayLabel(s, layoutType)).join(", ")}
                    </span>
                    <span className="ml-2 text-orange-600 font-bold">
                      ({selectedIds.length} {layoutType === "sleeper" ? "berth" : "seat"}{selectedIds.length > 1 ? "s" : ""})
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Boarding & Dropping Points */}
            <Card className="shadow-sm border">
              <CardContent className="p-5">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-orange-600" /> Boarding &amp; Dropping Points
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                      Boarding Point <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={boardingPoint}
                      onValueChange={(v) => { setBoardingPoint(v); setBoardingErr(false); }}
                    >
                      <SelectTrigger className={cn("h-11", boardingErr && "border-red-400")}>
                        <SelectValue placeholder="Select boarding point" />
                      </SelectTrigger>
                      <SelectContent>
                        {boardingPoints.map((pt) => (
                          <SelectItem key={pt} value={pt}>{pt} – {departure}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {boardingErr && <p className="text-xs text-red-500 mt-1">Please select a boarding point</p>}
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                      Dropping Point <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={droppingPoint}
                      onValueChange={(v) => { setDroppingPoint(v); setDroppingErr(false); }}
                    >
                      <SelectTrigger className={cn("h-11", droppingErr && "border-red-400")}>
                        <SelectValue placeholder="Select dropping point" />
                      </SelectTrigger>
                      <SelectContent>
                        {droppingPoints.map((pt) => (
                          <SelectItem key={pt} value={pt}>{pt} – {arrival}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {droppingErr && <p className="text-xs text-red-500 mt-1">Please select a dropping point</p>}
                  </div>
                </div>

                <div className="mt-4 flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700">
                  <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  Live GPS tracking available after boarding
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Fare Summary */}
          <div className="lg:w-72 shrink-0">
            <div className="sticky top-[80px] space-y-4">
              <Card className="shadow-sm border">
                <CardContent className="p-5 space-y-4">
                  <h3 className="font-bold text-slate-900">Fare Summary</h3>

                  {selectedIds.length === 0 ? (
                    <div className="text-center py-6">
                      <Bus className="w-10 h-10 text-orange-200 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {layoutType === "sleeper" ? "Select berths to see fare" : "Select seats to see fare"}
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Selected seats/berths */}
                      <div className="bg-orange-50 border border-orange-100 rounded-xl p-3">
                        <p className="text-xs font-bold text-orange-700 uppercase tracking-wide mb-2">
                          {layoutType === "sleeper" ? "Selected Berths" : "Selected Seats"}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedSeats.map((s) => (
                            <span
                              key={s.id}
                              className="px-2 py-0.5 bg-orange-500 text-white rounded-full text-xs font-bold shadow-sm"
                            >
                              {seatDisplayLabel(s, layoutType)}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {selectedIds.length} Passenger{selectedIds.length > 1 ? "s" : ""}
                        </p>
                      </div>

                      {/* Boarding & dropping */}
                      {(boardingPoint || droppingPoint) && (
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-2">
                          {boardingPoint && (
                            <div className="flex items-start gap-2 text-xs">
                              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                                <MapPin className="w-3 h-3 text-green-600" />
                              </div>
                              <div>
                                <p className="font-bold text-green-700">Boarding</p>
                                <p className="text-slate-700">{boardingPoint} – {departure}</p>
                              </div>
                            </div>
                          )}
                          {droppingPoint && (
                            <div className="flex items-start gap-2 text-xs">
                              <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                                <MapPin className="w-3 h-3 text-red-600" />
                              </div>
                              <div>
                                <p className="font-bold text-red-700">Dropping</p>
                                <p className="text-slate-700">{droppingPoint} – {arrival}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Fare breakdown */}
                      <div className="space-y-2 pt-2 border-t">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">
                            Base fare × {selectedIds.length}
                          </span>
                          <span className="font-medium">₹{(effectivePrice * selectedIds.length).toLocaleString("en-IN")}</span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>Taxes &amp; Fees</span>
                          <span>Included</span>
                        </div>
                        <div className="flex justify-between font-bold text-base border-t pt-2">
                          <span>Total</span>
                          <span className="text-orange-600">₹{totalAmount.toLocaleString("en-IN")}</span>
                        </div>
                      </div>

                      <Button
                        onClick={handleProceed}
                        disabled={selectedIds.length === 0 || !boardingPoint || !droppingPoint}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold h-11"
                      >
                        Continue to Booking
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              {selectedIds.length > 0 && (!boardingPoint || !droppingPoint) && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  Please select both boarding and dropping points to continue.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
