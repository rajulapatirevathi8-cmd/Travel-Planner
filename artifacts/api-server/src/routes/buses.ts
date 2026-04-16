import { Router, type IRouter } from "express";
import { ilike, eq } from "drizzle-orm";
import { db, busesTable } from "@workspace/db";
import {
  SearchBusesQueryParams,
  SearchBusesResponse,
  ListBusesResponse,
  GetBusParams,
  GetBusResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

// ── City data for bus search ─────────────────────────────────────────────────
const CITY_BUS_DATA: Record<string, { boarding: string[]; dropping: string[] }> = {
  hyderabad:      { boarding: ["MGBS (Imlibun)", "Ameerpet", "Kukatpally", "LB Nagar", "Uppal", "Secunderabad", "Dilsukhnagar"], dropping: ["MGBS (Imlibun)", "Koti", "LB Nagar", "Dilsukhnagar", "Secunderabad", "Uppal X Roads"] },
  mumbai:         { boarding: ["Dadar", "Borivali", "Thane", "Kurla", "Sion", "Panvel", "Vashi"], dropping: ["Dadar", "Borivali", "Thane", "Kurla", "Panvel"] },
  delhi:          { boarding: ["Kashmere Gate ISBT", "Sarai Kale Khan", "Anand Vihar", "Dhaula Kuan", "Nehru Place"], dropping: ["Kashmere Gate ISBT", "Sarai Kale Khan", "Anand Vihar", "Nehru Place"] },
  bangalore:      { boarding: ["Majestic (KBS)", "Silk Board", "Marathahalli", "Electronic City", "Hebbal", "Kalasipalya"], dropping: ["Majestic (KBS)", "Silk Board", "Koramangala", "Whitefield", "Hebbal"] },
  bengaluru:      { boarding: ["Majestic (KBS)", "Silk Board", "Marathahalli", "Electronic City", "Hebbal", "Kalasipalya"], dropping: ["Majestic (KBS)", "Silk Board", "Koramangala", "Whitefield", "Hebbal"] },
  chennai:        { boarding: ["Koyambedu", "Chennai Central", "Tambaram", "Guindy", "Broadway", "Perungudi"], dropping: ["Koyambedu", "Broadway", "Chennai Central", "Tambaram", "Guindy"] },
  pune:           { boarding: ["Shivajinagar", "Swargate", "Katraj", "Hadapsar", "Kothrud", "Deccan"], dropping: ["Shivajinagar", "Swargate", "Katraj", "Hadapsar", "Deccan"] },
  kolkata:        { boarding: ["Esplanade", "Howrah", "Salt Lake", "Park Street", "Babughat"], dropping: ["Esplanade", "Howrah", "Salt Lake", "Park Street"] },
  ahmedabad:      { boarding: ["Geeta Mandir", "Paldi", "Naroda", "Isanpur", "Vastral"], dropping: ["Geeta Mandir", "Paldi", "Naroda", "Kankaria"] },
  jaipur:         { boarding: ["Sindhi Camp", "Narayan Singh Circle", "Vidyadhar Nagar", "Ajmer Road"], dropping: ["Sindhi Camp", "Narayan Singh Circle", "Ajmer Road"] },
  kochi:          { boarding: ["KSRTC Bus Stand", "Aluva", "Edapally", "MG Road", "Vyttila"], dropping: ["KSRTC Bus Stand", "Aluva", "Edapally", "MG Road"] },
  goa:            { boarding: ["Panaji Bus Stand", "Mapusa", "Margao", "Vasco da Gama", "Calangute"], dropping: ["Panaji Bus Stand", "Mapusa", "Margao", "Vasco da Gama"] },
  vijayawada:     { boarding: ["Pandit Nehru Bus Station", "Benz Circle", "One Town", "Gunadala", "Auto Nagar"], dropping: ["Pandit Nehru Bus Station", "Benz Circle", "Auto Nagar", "One Town"] },
  visakhapatnam:  { boarding: ["RTC Complex", "Dwaraka Nagar", "MVP Colony", "Steel Plant"], dropping: ["RTC Complex", "Dwaraka Nagar", "MVP Colony"] },
  tirupati:       { boarding: ["Tirupati Bus Stand", "Renigunta", "Alipiri"], dropping: ["Tirupati Bus Stand", "Renigunta"] },
  coimbatore:     { boarding: ["Gandhipuram", "Ukkadam", "Singanallur", "Peelamedu"], dropping: ["Gandhipuram", "Ukkadam", "Singanallur"] },
  madurai:        { boarding: ["Madurai Bus Stand", "Anna Nagar", "Kalavasal"], dropping: ["Madurai Bus Stand", "Anna Nagar"] },
  mangalore:      { boarding: ["KSRTC Bus Stand", "Lalbagh", "Hampankatta"], dropping: ["KSRTC Bus Stand", "Lalbagh"] },
  nagpur:         { boarding: ["Nagpur Central Bus Stand", "Ganeshpeth", "Sitabuldi"], dropping: ["Nagpur Central Bus Stand", "Ganeshpeth"] },
  indore:         { boarding: ["Sarwate Bus Stand", "Rajwada", "Vijay Nagar", "Palasia"], dropping: ["Sarwate Bus Stand", "Rajwada", "Vijay Nagar"] },
  bhopal:         { boarding: ["Hamidia Road Bus Stand", "MP Nagar", "New Market"], dropping: ["Hamidia Road Bus Stand", "MP Nagar"] },
  lucknow:        { boarding: ["Alambagh Bus Stand", "Charbagh", "Hazratganj", "Gomti Nagar"], dropping: ["Alambagh Bus Stand", "Charbagh", "Gomti Nagar"] },
  surat:          { boarding: ["Surat Central Bus Stand", "Adajan", "Vesu", "Athwa Gate"], dropping: ["Surat Central Bus Stand", "Adajan", "Athwa Gate"] },
  vadodara:       { boarding: ["Sayajigunj Bus Stand", "Alkapuri", "Nizampura"], dropping: ["Sayajigunj Bus Stand", "Alkapuri"] },
  nashik:         { boarding: ["Nashik Central Bus Stand", "CBS", "Mahamarg Nagar"], dropping: ["Nashik Central Bus Stand", "CBS"] },
  aurangabad:     { boarding: ["Central Bus Stand", "Cidco", "Jalna Road"], dropping: ["Central Bus Stand", "Cidco"] },
  chandigarh:     { boarding: ["ISBT Sector 17", "Sector 22", "Sector 43"], dropping: ["ISBT Sector 17", "Sector 22"] },
  amritsar:       { boarding: ["ISBT Amritsar", "Hall Gate", "Golden Temple Road"], dropping: ["ISBT Amritsar", "Hall Gate"] },
  jalandhar:      { boarding: ["Jalandhar Bus Stand", "Nakodar Chowk"], dropping: ["Jalandhar Bus Stand"] },
  ludhiana:       { boarding: ["Ludhiana Bus Stand", "Ferozepur Road"], dropping: ["Ludhiana Bus Stand"] },
  dehradun:       { boarding: ["ISBT Dehradun", "Clock Tower", "Rajpur Road"], dropping: ["ISBT Dehradun", "Clock Tower"] },
  haridwar:       { boarding: ["Haridwar Bus Stand", "Har ki Pauri"], dropping: ["Haridwar Bus Stand"] },
  varanasi:       { boarding: ["Varanasi Bus Stand", "Godowlia", "Lanka"], dropping: ["Varanasi Bus Stand", "Godowlia"] },
  agra:           { boarding: ["Agra Fort Bus Stand", "Idgah Bus Stand", "Raja Mandi"], dropping: ["Agra Fort Bus Stand", "Idgah Bus Stand"] },
  patna:          { boarding: ["Patna Bus Stand", "Gandhi Maidan", "Boring Road"], dropping: ["Patna Bus Stand", "Gandhi Maidan"] },
  ranchi:         { boarding: ["Ranchi Bus Stand", "Kantatoli"], dropping: ["Ranchi Bus Stand"] },
  bhubaneswar:    { boarding: ["Baramunda Bus Stand", "Master Canteen", "Rasulgarh"], dropping: ["Baramunda Bus Stand", "Master Canteen"] },
  thiruvananthapuram: { boarding: ["KSRTC Bus Stand", "Thampanoor", "Palayam"], dropping: ["KSRTC Bus Stand", "Thampanoor"] },
  kozhikode:      { boarding: ["Kozhikode Bus Stand", "Mananchira", "KSRTC Bus Stand"], dropping: ["Kozhikode Bus Stand", "Mananchira"] },
  thrissur:       { boarding: ["Thrissur Bus Stand", "Round North"], dropping: ["Thrissur Bus Stand"] },
};

const APPROX_DISTANCE_KM: Record<string, number> = {
  "hyderabad-vijayawada": 270, "hyderabad-visakhapatnam": 620, "hyderabad-bangalore": 570,
  "hyderabad-chennai": 620, "hyderabad-pune": 560, "hyderabad-mumbai": 710, "hyderabad-goa": 680,
  "hyderabad-tirupati": 550, "hyderabad-nagpur": 500,
  "mumbai-pune": 150, "mumbai-goa": 600, "mumbai-nashik": 170, "mumbai-ahmedabad": 530,
  "mumbai-surat": 290, "mumbai-indore": 590, "mumbai-bangalore": 990, "mumbai-hyderabad": 710,
  "delhi-jaipur": 280, "delhi-agra": 200, "delhi-chandigarh": 250, "delhi-lucknow": 550,
  "delhi-varanasi": 820, "delhi-amritsar": 450, "delhi-dehradun": 330,
  "bangalore-chennai": 350, "bangalore-coimbatore": 360, "bangalore-goa": 560,
  "bangalore-hyderabad": 570, "bangalore-mangalore": 360, "bangalore-kochi": 600,
  "bangalore-pune": 840, "bangalore-madurai": 490,
  "chennai-coimbatore": 500, "chennai-madurai": 460, "chennai-kochi": 680,
  "chennai-bangalore": 350, "chennai-vijayawada": 430,
  "pune-goa": 460, "pune-nashik": 210, "pune-ahmedabad": 470, "pune-indore": 580,
  "ahmedabad-surat": 260, "ahmedabad-vadodara": 110, "ahmedabad-indore": 400,
  "kolkata-bhubaneswar": 440, "kolkata-patna": 580, "kolkata-ranchi": 380,
};

function getDistance(a: string, b: string): number {
  const k1 = `${a}-${b}`, k2 = `${b}-${a}`;
  return APPROX_DISTANCE_KM[k1] || APPROX_DISTANCE_KM[k2] || 400; // default 400 km
}

function getCityData(city: string): { boarding: string[]; dropping: string[] } {
  const key = city.toLowerCase().split(",")[0].trim().split(" ")[0];
  return CITY_BUS_DATA[key] || CITY_BUS_DATA[city.toLowerCase().split(",")[0].trim()]
    || { boarding: [`${city} Bus Stand`, `${city} Central`], dropping: [`${city} Bus Stand`] };
}

// ── GET /api/buses/live-search ───────────────────────────────────────────────
router.get("/buses/live-search", (req, res): void => {
  const rawFrom = (req.query.from as string | undefined) || "";
  const rawTo   = (req.query.to   as string | undefined) || "";

  const from = rawFrom.split(",")[0].trim();
  const to   = rawTo.split(",")[0].trim();

  if (!from || !to) {
    res.status(400).json({ error: "Both 'from' and 'to' are required." });
    return;
  }

  const distKm = getDistance(from.toLowerCase(), to.toLowerCase());
  const avgSpeedKmh = 60;
  const totalMins = Math.round((distKm / avgSpeedKmh) * 60);
  const durH = Math.floor(totalMins / 60);
  const durM = totalMins % 60;
  const durationStr = `${durH}h${durM > 0 ? ` ${durM}m` : ""}`;

  const fromData = getCityData(from);
  const toData   = getCityData(to);

  const seed = from.toLowerCase().split("").reduce((a, c) => a + c.charCodeAt(0), 0)
             + to.toLowerCase().split("").reduce((a, c) => a + c.charCodeAt(0), 0);

  const OPERATORS = [
    { name: "APSRTC",           types: ["AC Seater", "Non-AC Seater", "Volvo Multi-Axle"] },
    { name: "VRL Travels",      types: ["AC Sleeper", "AC Semi-Sleeper", "Non-AC Seater"] },
    { name: "Orange Travels",   types: ["AC Sleeper", "AC Semi-Sleeper"] },
    { name: "SRS Travels",      types: ["Non-AC Seater", "AC Seater"] },
    { name: "Patel Travels",    types: ["AC Sleeper", "AC Semi-Sleeper", "AC Seater"] },
    { name: "Neeta Tours",      types: ["AC Sleeper", "Volvo Multi-Axle"] },
    { name: "Paulo Travels",    types: ["AC Sleeper", "Scania Multi-Axle"] },
    { name: "KPN Travels",      types: ["AC Semi-Sleeper", "AC Seater"] },
    { name: "Chartered Bus",    types: ["AC Sleeper", "Volvo Multi-Axle"] },
    { name: "Raj National",     types: ["Non-AC Seater", "AC Seater"] },
    { name: "MSRTC Shivshahi",  types: ["AC Seater", "Volvo Multi-Axle"] },
    { name: "KSRTC Airavata",   types: ["Volvo Multi-Axle", "AC Sleeper"] },
  ];

  const BASE_PRICES: Record<string, number> = {
    "Non-AC Seater": Math.round(distKm * 1.2 / 50) * 50,
    "AC Seater":     Math.round(distKm * 1.8 / 50) * 50,
    "AC Semi-Sleeper": Math.round(distKm * 2.2 / 50) * 50,
    "AC Sleeper":    Math.round(distKm * 2.8 / 50) * 50,
    "Volvo Multi-Axle": Math.round(distKm * 3.2 / 50) * 50,
    "Scania Multi-Axle": Math.round(distKm * 3.5 / 50) * 50,
  };

  const DEP_TIMES = ["4:00 PM", "5:30 PM", "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM", "10:00 PM", "11:00 PM", "11:59 PM"];

  function addTime(hhmm12: string, addMins: number): string {
    const m = hhmm12.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!m) return hhmm12;
    let h = parseInt(m[1]), min = parseInt(m[2]);
    const pm = m[3].toUpperCase() === "PM";
    if (pm && h !== 12) h += 12;
    if (!pm && h === 12) h = 0;
    const totalM = h * 60 + min + addMins;
    const nextDay = totalM >= 1440;
    const rh = Math.floor((totalM % 1440) / 60);
    const rm = totalM % 60;
    const period = rh >= 12 ? "PM" : "AM";
    const displayH = rh > 12 ? rh - 12 : rh === 0 ? 12 : rh;
    return `${displayH}:${rm.toString().padStart(2, "0")} ${period}${nextDay ? " (+1)" : ""}`;
  }

  // Pick 6-8 unique operators deterministically
  const pickedCount = 6 + (seed % 3);
  const shuffled = [...OPERATORS].sort((a, b) => {
    const ha = (a.name.charCodeAt(0) * seed) % 100;
    const hb = (b.name.charCodeAt(0) * seed) % 100;
    return ha - hb;
  });
  const picked = shuffled.slice(0, pickedCount);

  const buses = picked.map((op, idx) => {
    const busType = op.types[(seed + idx) % op.types.length];
    const basePrice = BASE_PRICES[busType] || 500;
    const price = basePrice + (((seed * (idx + 1)) % 5) * 50);
    const depTime = DEP_TIMES[(idx + (seed % 3)) % DEP_TIMES.length];
    const arrTime = addTime(depTime, totalMins);

    const totalSeats = busType.includes("Sleeper") ? 36 : busType.includes("Semi") ? 40 : 45;
    const seatsAvailable = 3 + ((seed * idx + 7) % (totalSeats - 5));

    const amenities: string[] = [];
    if (!busType.includes("Non-AC")) amenities.push("AC");
    if (busType.includes("Volvo") || busType.includes("Scania") || busType.includes("Sleeper")) amenities.push("Wifi");
    if (busType.includes("Sleeper") || busType.includes("Volvo")) amenities.push("Charging");
    if (basePrice >= 600) amenities.push("Water Bottle");
    if (busType.includes("Sleeper")) amenities.push("Blanket");
    if (busType.includes("Volvo") || busType.includes("Scania")) amenities.push("Entertainment");

    const bPoints = fromData.boarding.slice(0, 4);
    const dPoints = toData.dropping.slice(0, 4);

    return {
      id: idx + 1,
      name: op.name,
      operator: op.name,
      from,
      to,
      departure: depTime,
      arrival: arrTime,
      duration: durationStr,
      price,
      busType,
      totalSeats,
      seatsAvailable,
      amenities,
      rating: parseFloat((3.5 + ((seed + idx * 7) % 15) / 10).toFixed(1)),
      boardingPoints: bPoints,
      droppingPoints: dPoints,
    };
  });

  res.json({ buses, total: buses.length, source: "generated", from, to, distanceKm: distKm });
});

router.get("/buses/search", async (req, res): Promise<void> => {
  const parsed = SearchBusesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { origin, destination } = parsed.data;

  let query = db.select().from(busesTable).$dynamic();

  const conditions = [];
  if (origin) {
    conditions.push(ilike(busesTable.origin, `%${origin}%`));
  }
  if (destination) {
    conditions.push(ilike(busesTable.destination, `%${destination}%`));
  }

  if (conditions.length > 0) {
    const { and } = await import("drizzle-orm");
    query = query.where(and(...conditions));
  }

  const buses = await query;
  const mapped = buses.map((b) => ({
    ...b,
    price: Number(b.price),
  }));
  res.json(SearchBusesResponse.parse(mapped));
});

router.get("/buses", async (_req, res): Promise<void> => {
  const buses = await db.select().from(busesTable).orderBy(busesTable.id);
  const mapped = buses.map((b) => ({
    ...b,
    price: Number(b.price),
  }));
  res.json(ListBusesResponse.parse(mapped));
});

router.get("/buses/:id", async (req, res): Promise<void> => {
  const params = GetBusParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [bus] = await db
    .select()
    .from(busesTable)
    .where(eq(busesTable.id, params.data.id));

  if (!bus) {
    res.status(404).json({ error: "Bus not found" });
    return;
  }

  res.json(GetBusResponse.parse({ ...bus, price: Number(bus.price) }));
});

export default router;
