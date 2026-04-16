import { useState, useEffect, useRef } from "react";
import { useLocation, useSearch } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import { getConvenienceFee, getHiddenMarkupAmount } from "@/lib/pricing";
import { autoSaveLead } from "@/lib/crm";
import { saveBookingSession } from "@/lib/booking-session";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Plane, ArrowLeft, Clock, Calendar, Users, CheckCircle2,
  ChevronRight, AlertCircle, UserPlus, Armchair, Luggage,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Passenger = {
  name: string;
  age: string;
  gender: string;
  email: string;
  phone: string;
};

const emptyPassenger = (): Passenger => ({ name: "", age: "", gender: "", email: "", phone: "" });

type FieldErrors = Partial<Record<keyof Passenger, string>>;

function validatePassengers(passengers: Passenger[]): FieldErrors[] {
  return passengers.map((p) => {
    const errors: FieldErrors = {};
    if (!p.name.trim() || p.name.trim().length < 2)
      errors.name = "Full name must be at least 2 characters";
    const age = parseInt(p.age);
    if (!p.age || isNaN(age) || age < 1 || age > 120)
      errors.age = "Enter a valid age (1–120)";
    if (!p.gender)
      errors.gender = "Please select a gender";
    if (!p.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email))
      errors.email = "Enter a valid email address";
    if (!p.phone.trim() || !/^\d{10}$/.test(p.phone.replace(/\D/g, "")))
      errors.phone = "Enter a valid 10-digit phone number";
    return errors;
  });
}

function formatDate(d: string) {
  if (!d) return "";
  try {
    return new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
      weekday: "long", day: "2-digit", month: "long", year: "numeric",
    });
  } catch { return d; }
}

const AIRLINE_GRADIENT: Record<string, string> = {
  indigo:      "from-blue-500 to-indigo-600",
  "air india": "from-red-500 to-orange-500",
  vistara:     "from-purple-500 to-violet-700",
  spicejet:    "from-red-500 to-rose-600",
  "akasa air": "from-yellow-400 to-orange-500",
  goair:       "from-sky-500 to-blue-600",
};
function airlineGradient(name: string) {
  const k = name.toLowerCase();
  for (const key in AIRLINE_GRADIENT) if (k.includes(key)) return AIRLINE_GRADIENT[key];
  return "from-slate-500 to-slate-700";
}

// ── Seat map config ──────────────────────────────────────────────────────────
const SEAT_ROWS = 6;
const SEAT_COLS = ["A", "B", "C", "D", "E", "F"];
// Some seats are pre-occupied (fake)
const TAKEN_SEATS = new Set(["1A","1B","2C","2F","3D","4A","4E","5B","5F","6C"]);

const BAGGAGE_OPTIONS = [
  { kg: 0,  label: "No extra baggage",  price: 0,    tag: "Free" },
  { kg: 15, label: "+15 kg baggage",    price: 799,  tag: "+₹799" },
  { kg: 20, label: "+20 kg baggage",    price: 1099, tag: "+₹1,099" },
  { kg: 30, label: "+30 kg baggage",    price: 1499, tag: "+₹1,499" },
];

const DOMESTIC_CITIES = new Set([
  "delhi","mumbai","bangalore","bengaluru","chennai","kolkata",
  "hyderabad","pune","ahmedabad","jaipur","lucknow","bhopal",
  "chandigarh","goa","kochi","indore","nagpur","patna","surat",
  "vadodara","agra","visakhapatnam","bhubaneswar","coimbatore",
  "mangalore","amritsar","trichy","madurai","ranchi","raipur","varanasi",
]);

export default function FlightBooking() {
  const searchString = useSearch();
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isAgent } = useAuth();
  const { toast } = useToast();

  const p = new URLSearchParams(searchString);
  const flightId    = p.get("id")            || "";
  const airline     = p.get("airline")       || "Airline";
  const flightNum   = p.get("flightNumber")  || "";
  const from        = p.get("from")          || "";
  const to          = p.get("to")            || "";
  const departure   = p.get("departure")     || "";
  const arrival     = p.get("arrival")       || "";
  const duration    = p.get("duration")      || "";
  const date        = p.get("date")          || "";
  const rawPrice           = parseInt(p.get("price")           || "0",  10);
  const markupFromUrl      = parseInt(p.get("markup")          || "-1", 10);
  const priceWithMarkupUrl = parseInt(p.get("priceWithMarkup") || "-1", 10);
  const normalMarkupUrl    = parseInt(p.get("normalMarkup")    || "-1", 10);
  const agentSavingsUrl    = parseInt(p.get("agentSavings")    || "0",  10);
  const travelers          = parseInt(p.get("travelers")       || "1",  10);

  const hiddenMarkup   = markupFromUrl >= 0 ? markupFromUrl : getHiddenMarkupAmount(rawPrice, "flights");
  const baseFare       = priceWithMarkupUrl > 0 ? priceWithMarkupUrl : rawPrice + hiddenMarkup;
  const convFee        = getConvenienceFee(rawPrice, "flights");
  const savings        = (isAgent && agentSavingsUrl > 0) ? agentSavingsUrl : 0;

  const [passengers,    setPassengers]    = useState<Passenger[]>(Array.from({ length: travelers }, emptyPassenger));
  const [errors,        setErrors]        = useState<FieldErrors[]>(Array.from({ length: travelers }, () => ({})));
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [extraBaggageKg,  setExtraBaggageKg]  = useState(0);
  const [extraBaggageCost,setExtraBaggageCost]= useState(0);

  // Pre-fill from logged-in user
  useEffect(() => {
    if (user && passengers[0].email === "") {
      setPassengers((prev) => {
        const next = [...prev];
        next[0] = { ...next[0], name: user.name || "", email: user.email || "", phone: user.phone || "" };
        return next;
      });
    }
  }, [user]);

  // Abandoned lead timer
  const abandonedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const name  = passengers[0]?.name?.trim()  ?? "";
    const phone = passengers[0]?.phone?.trim().replace(/\D/g,"") ?? "";
    if (name.length >= 2 && phone.length === 10) {
      if (abandonedTimerRef.current) clearTimeout(abandonedTimerRef.current);
      abandonedTimerRef.current = setTimeout(() => {
        autoSaveLead(name, phone, "flight", passengers[0]?.email || undefined, `Abandoned flight booking: ${from} → ${to}`, "auto", "abandoned");
      }, 2 * 60 * 1000);
    } else {
      if (abandonedTimerRef.current) { clearTimeout(abandonedTimerRef.current); abandonedTimerRef.current = null; }
    }
    return () => { if (abandonedTimerRef.current) clearTimeout(abandonedTimerRef.current); };
  }, [passengers[0]?.name, passengers[0]?.phone]);

  function updatePassenger(i: number, field: keyof Passenger, value: string) {
    setPassengers((prev) => { const next = [...prev]; next[i] = { ...next[i], [field]: value }; return next; });
    setErrors((prev)     => { const next = [...prev]; next[i] = { ...next[i], [field]: undefined }; return next; });
  }

  function toggleSeat(seat: string) {
    if (TAKEN_SEATS.has(seat)) return;
    setSelectedSeats((prev) => {
      if (prev.includes(seat)) return prev.filter((s) => s !== seat);
      if (prev.length >= travelers) {
        toast({ title: `Max ${travelers} seat${travelers>1?"s":""}`, description: "Remove a seat first to change selection.", variant: "destructive" });
        return prev;
      }
      return [...prev, seat];
    });
  }

  function selectBaggage(kg: number, price: number) {
    setExtraBaggageKg(kg);
    setExtraBaggageCost(price);
  }

  const totalBase = (baseFare + convFee) * travelers + extraBaggageCost;

  function handleContinue() {
    const validated = validatePassengers(passengers);
    if (validated.some((e) => Object.keys(e).length > 0)) {
      setErrors(validated);
      toast({ variant: "destructive", title: "Please fill all passenger details", description: "Check the form for errors." });
      return;
    }

    if (abandonedTimerRef.current) clearTimeout(abandonedTimerRef.current);

    saveBookingSession({
      type: "flight",
      flightId, airline, flightNum,
      from, to, date, departure, arrival, duration,
      passengers, travelers, selectedSeats,
      extraBaggageKg, extraBaggageCost,
      rawPrice, hiddenMarkup, baseFare, convFee, totalBase,
      isAgent, agentSavings: agentSavingsUrl, normalMarkup: normalMarkupUrl >= 0 ? normalMarkupUrl : hiddenMarkup,
      agentId:    isAgent ? user?.id    : undefined,
      agentEmail: isAgent ? user?.email : undefined,
    });

    setLocation("/booking/payment");
  }

  const gradient = airlineGradient(airline);

  return (
    <Layout>
      {/* Page header */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white">
        <div className="container mx-auto px-4 py-5">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-1.5 text-blue-200 hover:text-white text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to results
          </button>

          <div className="flex items-center gap-2 text-sm mb-5">
            {["Flight Selection", "Passenger Details", "Payment"].map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2",
                  i === 1 ? "bg-white text-blue-700 border-white"
                  : i < 1 ? "bg-blue-500 border-blue-500 text-white"
                  : "border-blue-400 text-blue-400"
                )}>
                  {i < 1 ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <span className={cn("hidden sm:inline", i === 1 ? "font-bold" : "text-blue-300")}>{step}</span>
                {i < 2 && <ChevronRight className="w-4 h-4 text-blue-400" />}
              </div>
            ))}
          </div>

          <h1 className="text-2xl font-extrabold">Passenger Details</h1>
          <p className="text-blue-200 text-sm mt-0.5">Fill in details, choose seats & baggage, then continue to payment</p>
        </div>
      </div>

      <div className="bg-slate-50 min-h-screen">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-6">

            {/* Left column */}
            <div className="flex-1 min-w-0 space-y-5">

              {!isAuthenticated && (
                <Alert className="border-blue-200 bg-blue-50">
                  <UserPlus className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 text-sm">
                    <span className="font-semibold">No login needed!</span> An account will be created automatically after payment.
                  </AlertDescription>
                </Alert>
              )}

              {/* Flight Summary */}
              <Card className="shadow-sm border overflow-hidden">
                <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-5 py-3 flex items-center gap-2">
                  <Plane className="w-4 h-4 text-white" />
                  <span className="text-white font-semibold text-sm">Flight Summary</span>
                </div>
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-5">
                    <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-sm shrink-0", gradient)}>
                      <span className="text-white font-extrabold text-sm">{airline.substring(0,2).toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{airline}</p>
                      <p className="text-xs text-muted-foreground">{flightNum}</p>
                    </div>
                    <Badge className="ml-auto bg-slate-100 text-slate-600 border-0">Economy</Badge>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl mb-4">
                    <div>
                      <p className="text-3xl font-extrabold text-slate-900 tabular-nums">{departure}</p>
                      <p className="text-sm font-semibold text-slate-600 mt-0.5">{from}</p>
                    </div>
                    <div className="flex-1 flex flex-col items-center">
                      <p className="text-xs text-muted-foreground font-medium mb-1">{duration}</p>
                      <div className="w-full flex items-center gap-1">
                        <div className="flex-1 h-px bg-slate-300" />
                        <div className="w-7 h-7 rounded-full bg-blue-50 border-2 border-blue-200 flex items-center justify-center">
                          <Plane className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                        <div className="flex-1 h-px bg-slate-300" />
                      </div>
                      <p className="text-[11px] text-green-600 font-bold mt-1 uppercase tracking-wide">Non-stop</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-extrabold text-slate-900 tabular-nums">{arrival}</p>
                      <p className="text-sm font-semibold text-slate-600 mt-0.5">{to}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { icon: Calendar, label: "Date",      value: formatDate(date) || "—" },
                      { icon: Clock,    label: "Duration",  value: duration || "—"          },
                      { icon: Users,    label: "Travelers", value: `${travelers} Adult${travelers>1?"s":""}` },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex flex-col items-center p-3 bg-slate-50 rounded-xl border text-center">
                        <Icon className="w-4 h-4 text-blue-600 mb-1" />
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">{label}</p>
                        <p className="text-xs font-bold text-slate-800 mt-0.5 leading-tight">{value}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Seat Selection */}
              <Card className="shadow-sm border">
                <CardHeader className="pb-3 pt-5 px-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <Armchair className="w-4 h-4" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Seat Selection</CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">Select up to {travelers} seat{travelers>1?"s":""} · optional</p>
                    </div>
                    {selectedSeats.length > 0 && (
                      <Badge className="ml-auto bg-blue-100 text-blue-700 border-0">
                        {selectedSeats.join(", ")}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  {/* Legend */}
                  <div className="flex items-center flex-wrap gap-3 mb-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5"><div className="w-5 h-5 rounded bg-slate-100 border border-slate-300" />Available</div>
                    <div className="flex items-center gap-1.5"><div className="w-5 h-5 rounded bg-blue-500" />Selected</div>
                    <div className="flex items-center gap-1.5"><div className="w-5 h-5 rounded bg-slate-300" />Taken</div>
                  </div>

                  {/* Seat grid with horizontal scroll on very small screens */}
                  <div className="overflow-x-auto">
                  {/* Column headers */}
                  <div className="mb-2">
                    <div className="flex gap-1 justify-center">
                      {SEAT_COLS.map((col, ci) => (
                        <div key={col} className={cn("w-9 text-center text-[10px] font-bold text-slate-400", ci === 2 && "mr-3")}>
                          {col}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Seat grid */}
                  <div className="space-y-1.5">
                    {Array.from({ length: SEAT_ROWS }).map((_, row) => (
                      <div key={row} className="flex gap-1 items-center justify-center">
                        <span className="text-[10px] text-slate-400 w-4 text-right mr-1">{row+1}</span>
                        {SEAT_COLS.map((col, ci) => {
                          const seat = `${row+1}${col}`;
                          const taken    = TAKEN_SEATS.has(seat);
                          const selected = selectedSeats.includes(seat);
                          return (
                            <button
                              key={seat}
                              onClick={() => toggleSeat(seat)}
                              disabled={taken}
                              title={seat}
                              className={cn(
                                "w-9 h-9 rounded text-[10px] font-bold border transition-all",
                                ci === 2 && "mr-3",
                                taken    ? "bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed"
                                : selected ? "bg-blue-500 border-blue-600 text-white shadow-md scale-105"
                                : "bg-white border-slate-300 text-slate-600 hover:bg-blue-50 hover:border-blue-400 cursor-pointer"
                              )}
                            >
                              {seat}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 text-center text-[11px] text-muted-foreground">
                    ✈ Front of aircraft
                  </div>
                  </div>{/* end overflow-x-auto */}
                </CardContent>
              </Card>

              {/* Extra Baggage */}
              <Card className="shadow-sm border">
                <CardHeader className="pb-3 pt-5 px-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center shrink-0">
                      <Luggage className="w-4 h-4" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Extra Baggage</CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">Cabin bag (7kg) included free for all passengers</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <div className="grid grid-cols-2 gap-3">
                    {BAGGAGE_OPTIONS.map(({ kg, label, price, tag }) => {
                      const selected = extraBaggageKg === kg;
                      return (
                        <button
                          key={kg}
                          onClick={() => selectBaggage(kg, price)}
                          className={cn(
                            "flex flex-col items-start p-3 rounded-xl border-2 text-left transition-all",
                            selected
                              ? "border-orange-500 bg-orange-50"
                              : "border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50/50"
                          )}
                        >
                          <div className="flex items-center justify-between w-full mb-1">
                            <span className={cn("text-sm font-bold", selected ? "text-orange-700" : "text-slate-700")}>
                              {kg === 0 ? "None" : `${kg}kg`}
                            </span>
                            <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full",
                              selected ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-500"
                            )}>{tag}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{label}</span>
                          {selected && <CheckCircle2 className="w-4 h-4 text-orange-500 mt-1.5" />}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Passenger Details */}
              {Array.from({ length: travelers }).map((_, i) => (
                <Card key={i} className="shadow-sm border">
                  <CardHeader className="pb-4 pt-5 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                        {i + 1}
                      </div>
                      <div>
                        <CardTitle className="text-base">
                          {i === 0 ? "Primary Passenger" : `Passenger ${i + 1}`}
                        </CardTitle>
                        {i === 0 && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Booking confirmation will be sent here
                          </p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-5 pb-5 space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        placeholder="As on government ID"
                        value={passengers[i].name}
                        onChange={(e) => updatePassenger(i, "name", e.target.value)}
                        className={cn("h-11", errors[i]?.name && "border-red-400")}
                      />
                      {errors[i]?.name && <p className="text-xs text-red-500 mt-1">{errors[i].name}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                          Age <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="number" min={1} max={120} placeholder="Enter age"
                          value={passengers[i].age}
                          onChange={(e) => updatePassenger(i, "age", e.target.value)}
                          className={cn("h-11", errors[i]?.age && "border-red-400")}
                        />
                        {errors[i]?.age && <p className="text-xs text-red-500 mt-1">{errors[i].age}</p>}
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                          Gender <span className="text-red-500">*</span>
                        </label>
                        <Select value={passengers[i].gender} onValueChange={(v) => updatePassenger(i, "gender", v)}>
                          <SelectTrigger className={cn("h-11", errors[i]?.gender && "border-red-400")}>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors[i]?.gender && <p className="text-xs text-red-500 mt-1">{errors[i].gender}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="email" placeholder="passenger@email.com"
                        value={passengers[i].email}
                        onChange={(e) => updatePassenger(i, "email", e.target.value)}
                        className={cn("h-11", errors[i]?.email && "border-red-400")}
                      />
                      {errors[i]?.email && <p className="text-xs text-red-500 mt-1">{errors[i].email}</p>}
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-2">
                        <div className="flex items-center gap-1.5 border rounded-md px-3 bg-muted/30 text-sm font-medium text-slate-600 shrink-0">
                          🇮🇳 +91
                        </div>
                        <Input
                          type="tel" placeholder="10-digit mobile number" maxLength={10}
                          value={passengers[i].phone}
                          onChange={(e) => updatePassenger(i, "phone", e.target.value.replace(/\D/g,""))}
                          className={cn("h-11 flex-1", errors[i]?.phone && "border-red-400")}
                        />
                      </div>
                      {errors[i]?.phone && <p className="text-xs text-red-500 mt-1">{errors[i].phone}</p>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Right: Price summary + Continue */}
            <div className="w-full lg:w-80 shrink-0">
              <div className="sticky top-4 space-y-4">
                <Card className="shadow-sm border">
                  <CardHeader className="pb-3 pt-5 px-5">
                    <CardTitle className="text-base">Price Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 pb-5 space-y-4">

                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                      <p className="text-xs text-blue-600 font-medium mb-1">Base Fare (per person)</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold text-blue-800">₹</span>
                        <span className="text-3xl font-extrabold text-blue-800 tabular-nums">{baseFare.toLocaleString("en-IN")}</span>
                      </div>
                      {savings > 0 && (
                        <p className="text-xs text-green-600 font-semibold mt-1">Agent saves ₹{savings.toLocaleString("en-IN")} per person</p>
                      )}
                    </div>

                    <div className="space-y-2.5">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Breakdown</p>
                      <div className="flex justify-between text-sm text-slate-600">
                        <span>Base Fare × {travelers}</span>
                        <span className="font-medium">₹{(baseFare * travelers).toLocaleString("en-IN")}</span>
                      </div>
                      {convFee > 0 && (
                        <div className="flex justify-between text-sm text-slate-600">
                          <span>Convenience Fee × {travelers}</span>
                          <span className="font-medium">+₹{(convFee * travelers).toLocaleString("en-IN")}</span>
                        </div>
                      )}
                      {extraBaggageCost > 0 && (
                        <div className="flex justify-between text-sm text-slate-600">
                          <span>Extra Baggage ({extraBaggageKg}kg)</span>
                          <span className="font-medium">+₹{extraBaggageCost.toLocaleString("en-IN")}</span>
                        </div>
                      )}
                      {isAgent && savings > 0 && (
                        <div className="flex justify-between text-xs text-emerald-600 bg-emerald-50 rounded-lg px-2 py-1.5">
                          <span className="font-medium">Commission saved × {travelers}</span>
                          <span className="font-bold">₹{(savings * travelers).toLocaleString("en-IN")}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-extrabold text-lg pt-3 border-t border-dashed text-slate-900">
                        <span>Total</span>
                        <span className="text-blue-700">₹{totalBase.toLocaleString("en-IN")}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Coupons & credits applied on next step</p>
                    </div>

                    <Button
                      size="lg"
                      onClick={handleContinue}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold h-12 text-base gap-2 shadow-md mt-2"
                    >
                      Continue to Payment <ChevronRight className="w-4 h-4" />
                    </Button>

                    {!isAuthenticated && (
                      <p className="text-[11px] text-center text-slate-500">
                        Your account will be created automatically after payment
                      </p>
                    )}

                    <div className="space-y-1.5 pt-2 border-t">
                      {["No login required to book", "Instant e-ticket on confirmation", "24/7 customer support"].map((t) => (
                        <div key={t} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                          {t}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
