// ── Holiday Packages + Lead/Enquiry System ───────────────────────────────────

export interface HolidayPackage {
  id: number;
  name: string;
  destination: string;
  type: "beach" | "adventure" | "cultural" | "luxury" | "family" | "honeymoon" | "hill";
  duration: string;
  nights: number;
  pricePerPerson: number;
  rating: number;
  ratingCount: number;
  images: string[];
  highlights: string[];
  description: string;
  inclusions: string[];
  exclusions: string[];
}

export interface ItineraryDay {
  day: number;
  title: string;
  description?: string;
  meals: string;
  hotel?: string;
  activities?: string[];
  accommodation?: string;
}

export type LeadStatus = "new" | "contacted" | "interested" | "booked";

export interface HolidayLead {
  id: string;
  name: string;
  phone: string;
  destination: string;
  date: string;
  people: number;
  status: LeadStatus;
  createdAt: string;
}

export interface HolidayEnquiry {
  id: string;
  name: string;
  phone: string;
  email?: string;
  packageId: number;
  packageName: string;
  destination: string;
  people: number;
  travelDate: string;
  message?: string;
  status: "pending" | "contacted" | "converted";
  createdAt: string;
}

// ── Storage keys ─────────────────────────────────────────────────────────────
const LEADS_KEY     = "holiday_leads";
const ENQUIRIES_KEY = "holiday_enquiries";
const ITINERARY_KEY = "holiday_itineraries"; // admin edits

// ── Lead CRUD ─────────────────────────────────────────────────────────────────
export function getLeads(): HolidayLead[] {
  try { return JSON.parse(localStorage.getItem(LEADS_KEY) ?? "[]"); } catch { return []; }
}
export function saveLead(lead: Omit<HolidayLead, "id" | "createdAt" | "status">): HolidayLead {
  const all   = getLeads();
  const entry: HolidayLead = { ...lead, status: "new", id: `LD-${Date.now()}`, createdAt: new Date().toISOString() };
  localStorage.setItem(LEADS_KEY, JSON.stringify([entry, ...all]));
  return entry;
}
export function updateLeadStatus(id: string, status: LeadStatus) {
  const all = getLeads().map((l) => (l.id === id ? { ...l, status } : l));
  localStorage.setItem(LEADS_KEY, JSON.stringify(all));
}

// ── Enquiry CRUD ──────────────────────────────────────────────────────────────
export function getEnquiries(): HolidayEnquiry[] {
  try { return JSON.parse(localStorage.getItem(ENQUIRIES_KEY) ?? "[]"); } catch { return []; }
}
export function saveEnquiry(enq: Omit<HolidayEnquiry, "id" | "createdAt" | "status">): HolidayEnquiry {
  const all  = getEnquiries();
  const entry: HolidayEnquiry = { ...enq, id: `EQ-${Date.now()}`, status: "pending", createdAt: new Date().toISOString() };
  localStorage.setItem(ENQUIRIES_KEY, JSON.stringify([entry, ...all]));
  return entry;
}
export function updateEnquiryStatus(id: string, status: HolidayEnquiry["status"]) {
  const all = getEnquiries().map((e) => (e.id === id ? { ...e, status } : e));
  localStorage.setItem(ENQUIRIES_KEY, JSON.stringify(all));
}

// ── Itinerary override (admin edits) ──────────────────────────────────────────
export function getSavedItinerary(pkgId: number): ItineraryDay[] | null {
  try {
    const all = JSON.parse(localStorage.getItem(ITINERARY_KEY) ?? "{}");
    return all[pkgId] ?? null;
  } catch { return null; }
}
export function saveItinerary(pkgId: number, days: ItineraryDay[]) {
  const all = (() => { try { return JSON.parse(localStorage.getItem(ITINERARY_KEY) ?? "{}"); } catch { return {}; } })();
  all[pkgId] = days;
  localStorage.setItem(ITINERARY_KEY, JSON.stringify(all));
}

// ── AI Itinerary templates (simulate AI generation) ──────────────────────────
export const ITINERARY_TEMPLATES: Record<string, ItineraryDay[]> = {
  Goa: [
    { day: 1, title: "Arrival & North Goa Beach Evening", activities: ["Airport pickup", "Check-in at hotel", "Visit Calangute & Baga Beach", "Sunset at Fort Aguada", "Beach-side dinner with seafood"], meals: "Dinner", accommodation: "3★ Beach Resort" },
    { day: 2, title: "North Goa Sightseeing Tour", activities: ["Visit Basilica of Bom Jesus", "Old Goa churches tour", "Anjuna flea market", "Vagator Beach", "Nightlife at Tito's Lane"], meals: "Breakfast, Dinner", accommodation: "3★ Beach Resort" },
    { day: 3, title: "South Goa & Water Sports", activities: ["Colva Beach & Benaulim Beach", "Dolphin watching cruise", "Dudhsagar Waterfall visit", "Water sports: parasailing, jet ski", "Shopping at Panjim market"], meals: "Breakfast, Lunch", accommodation: "3★ Beach Resort" },
    { day: 4, title: "Checkout & Departure", activities: ["Morning beach walk", "Breakfast and checkout", "Last-minute souvenir shopping", "Airport/railway station drop"], meals: "Breakfast", accommodation: "—" },
  ],
  Kashmir: [
    { day: 1, title: "Arrival in Srinagar & Dal Lake", activities: ["Airport pickup in Srinagar", "Check-in to Houseboat on Dal Lake", "Shikara ride at sunset", "Dal Lake floating market visit", "Welcome Wazwan dinner"], meals: "Dinner", accommodation: "Houseboat, Dal Lake" },
    { day: 2, title: "Mughal Gardens & City Tour", activities: ["Shalimar Bagh (Mughal garden)", "Nishat Bagh garden", "Chashme Shahi garden", "Shankaracharya Temple visit", "Local handicraft shopping (shawls, walnut carvings)"], meals: "Breakfast, Dinner", accommodation: "Houseboat, Dal Lake" },
    { day: 3, title: "Gulmarg Day Trip", activities: ["Drive to Gulmarg (56km)", "Gondola cable car ride to Kongdoori", "Snow activities (season permitting)", "Meadow walk & photography", "Evening back to Srinagar"], meals: "Breakfast, Lunch", accommodation: "Houseboat, Dal Lake" },
    { day: 4, title: "Pahalgam Day Trip", activities: ["Drive to Pahalgam (95km)", "Betaab Valley visit", "Aru Valley nature walk", "Lidder River rafting", "Evening return to Srinagar"], meals: "Breakfast, Dinner", accommodation: "Houseboat, Dal Lake" },
    { day: 5, title: "Sonamarg Excursion & Departure", activities: ["Drive to Sonamarg (80km)", "Thajiwas Glacier pony ride", "Photography at Sindh River", "Return to Srinagar", "Airport drop"], meals: "Breakfast", accommodation: "—" },
  ],
  Kerala: [
    { day: 1, title: "Arrival in Kochi & Fort Kochi Tour", activities: ["Cochin airport pickup", "Chinese fishing nets visit", "Fort Kochi heritage walk", "Jew Town & Paradesi Synagogue", "Kathakali dance performance evening"], meals: "Dinner", accommodation: "Heritage Homestay, Fort Kochi" },
    { day: 2, title: "Munnar Hills – Tea & Spice Country", activities: ["Drive to Munnar (130km)", "Mattupetty Dam & Echo Point", "Tea Garden tour & factory visit", "Spice plantation walk", "Sunset at Top Station"], meals: "Breakfast, Lunch, Dinner", accommodation: "Tea Estate Resort, Munnar" },
    { day: 3, title: "Thekkady Wildlife & Spice Tour", activities: ["Drive to Thekkady (90km)", "Periyar Wildlife Sanctuary boat cruise", "Elephant interaction experience", "Spice garden guided tour", "Cultural bamboo rafting (optional)"], meals: "Breakfast, Dinner", accommodation: "Jungle Resort, Thekkady" },
    { day: 4, title: "Alleppey Houseboat & Backwaters", activities: ["Drive to Alleppey (100km)", "Board traditional Kerala houseboat", "Village walk along backwater canals", "Village fishing experience", "Sunset cruise"], meals: "Breakfast, Lunch, Dinner (on houseboat)", accommodation: "Luxury Houseboat, Alleppey" },
    { day: 5, title: "Kovalam Beach & Departure", activities: ["Morning cruise on backwaters", "Drive to Kovalam Beach (150km)", "Lighthouse Beach relaxation", "Ayurvedic massage session", "Thiruvananthapuram airport drop"], meals: "Breakfast, Lunch", accommodation: "—" },
  ],
  Rajasthan: [
    { day: 1, title: "Arrival in Jaipur – Pink City", activities: ["Jaipur airport/station pickup", "Check-in & freshen up", "City Palace visit", "Jantar Mantar observatory", "Hawa Mahal (Palace of Winds)", "Johri Bazaar evening shopping"], meals: "Dinner", accommodation: "Heritage Haveli, Jaipur" },
    { day: 2, title: "Jaipur Forts & Amber Palace", activities: ["Amber Fort elephant ride", "Sheesh Mahal (mirror palace)", "Nahargarh Fort sunset view", "Jal Mahal (water palace) photos", "Traditional Rajasthani dinner with folk music"], meals: "Breakfast, Dinner", accommodation: "Heritage Haveli, Jaipur" },
    { day: 3, title: "Jaisalmer – Golden City", activities: ["Drive/fly to Jaisalmer", "Jaisalmer Fort (living fort)", "Patwon ki Haveli", "Gadi Sagar Lake sunset", "Overnight desert camp arrangements"], meals: "Breakfast, Dinner", accommodation: "Desert Haveli, Jaisalmer" },
    { day: 4, title: "Sam Sand Dunes Desert Safari", activities: ["Morning fort walk", "Sam Sand Dunes camel safari", "Desert jeep safari", "Cultural evening – folk dance, bonfire", "Stargazing in the desert"], meals: "Breakfast, Dinner (at desert camp)", accommodation: "Luxury Desert Camp, Sam" },
    { day: 5, title: "Jodhpur – Blue City & Departure", activities: ["Drive to Jodhpur (275km)", "Mehrangarh Fort visit", "Jaswant Thada memorial", "Blue City old town walk", "Sardar Market shopping & departure"], meals: "Breakfast, Lunch", accommodation: "—" },
  ],
  Manali: [
    { day: 1, title: "Arrival in Manali & Old Town", activities: ["Bhuntar airport pickup", "Check-in at hotel", "Old Manali walk", "Hadimba Devi Temple visit", "Vashisht hot water springs"], meals: "Dinner", accommodation: "Mountain Resort, Manali" },
    { day: 2, title: "Solang Valley & Adventure Sports", activities: ["Solang Valley (13km)", "Ropeway / Gondola ride", "Zorbing, paragliding, snow scooter", "Beas River rafting", "Evening bonfire at camp"], meals: "Breakfast, Lunch, Dinner", accommodation: "Mountain Resort, Manali" },
    { day: 3, title: "Rohtang Pass Excursion", activities: ["Early morning drive to Rohtang Pass (51km)", "Snow play and photography", "Gulaba Valley meadows", "View of glaciers", "Return via Marhi dhaba lunch"], meals: "Breakfast, Lunch", accommodation: "Mountain Resort, Manali" },
    { day: 4, title: "Kullu & Manikaran", activities: ["Drive to Kullu (40km)", "Kullu shawl weaving tour", "Raghunath temple visit", "Manikaran hot springs & Gurudwara", "Parvati River valley scenic drive"], meals: "Breakfast, Dinner", accommodation: "Mountain Resort, Manali" },
    { day: 5, title: "Departure", activities: ["Morning leisure walk", "Breakfast and checkout", "Tibetan market souvenir shopping", "Bhuntar airport drop"], meals: "Breakfast", accommodation: "—" },
  ],
  Andaman: [
    { day: 1, title: "Arrival in Port Blair", activities: ["Port Blair airport pickup", "Cellular Jail visit", "Sound & Light Show at Cellular Jail", "Corbyn's Cove Beach evening", "Welcome dinner at seafood restaurant"], meals: "Dinner", accommodation: "3★ Hotel, Port Blair" },
    { day: 2, title: "Ross & North Bay Islands", activities: ["Ross Island (former British HQ)", "Snorkeling at North Bay Island", "Glass-bottom boat ride", "Rajiv Gandhi Water Sports Complex", "Aberdeen Bazaar evening shopping"], meals: "Breakfast, Lunch", accommodation: "3★ Hotel, Port Blair" },
    { day: 3, title: "Havelock Island – Radhanagar Beach", activities: ["Ferry to Havelock Island (90 mins)", "Check-in at eco resort", "Radhanagar Beach (Asia's best beach)", "Elephant Beach snorkeling trip", "Sunset viewing"], meals: "Breakfast, Dinner", accommodation: "Eco Resort, Havelock" },
    { day: 4, title: "Neil Island Exploration", activities: ["Ferry to Neil Island (45 mins)", "Natural Bridge Rock formation", "Bharatpur Beach water sports", "Sitapur Beach sunrise", "Return to Havelock"], meals: "Breakfast, Lunch", accommodation: "Eco Resort, Havelock" },
    { day: 5, title: "Departure from Port Blair", activities: ["Ferry back to Port Blair", "Samudrika Naval Marine Museum", "Local market shopping", "Airport departure"], meals: "Breakfast", accommodation: "—" },
  ],
  default: [
    { day: 1, title: "Arrival & Check-in", activities: ["Airport/station pickup", "Hotel check-in", "Local area orientation", "Welcome dinner"], meals: "Dinner", accommodation: "Hotel" },
    { day: 2, title: "Main Attractions Tour", activities: ["Major sightseeing spots", "Local cuisine experience", "Cultural show"], meals: "Breakfast, Dinner", accommodation: "Hotel" },
    { day: 3, title: "Leisure & Activities", activities: ["Free time for shopping", "Adventure activities", "Spa or relaxation"], meals: "Breakfast", accommodation: "Hotel" },
    { day: 4, title: "Departure", activities: ["Breakfast and checkout", "Last-minute shopping", "Airport/station drop"], meals: "Breakfast", accommodation: "—" },
  ],
};

export function getItinerary(destination: string, pkgId: number): ItineraryDay[] {
  const saved = getSavedItinerary(pkgId);
  if (saved) return saved;
  // Match destination to template
  const key = Object.keys(ITINERARY_TEMPLATES).find(
    (k) => destination.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(destination.toLowerCase())
  );
  return ITINERARY_TEMPLATES[key ?? "default"];
}

// ── Mock package data ─────────────────────────────────────────────────────────
export const MOCK_PACKAGES: HolidayPackage[] = [
  {
    id: 101,
    name: "Goa Beach Bliss",
    destination: "Goa",
    type: "beach",
    duration: "4D/3N",
    nights: 3,
    pricePerPerson: 12000,
    rating: 4.5,
    ratingCount: 1840,
    images: [
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80",
    ],
    highlights: ["Baga & Calangute Beach", "Fort Aguada", "Water Sports", "Old Goa Churches", "Seafood Dinners"],
    description: "Experience the sun, sand, and soul of India's party capital. Enjoy pristine beaches, vibrant nightlife, and fresh Goan seafood.",
    inclusions: ["Hotel (3★ Beach Resort)", "Daily breakfast", "Airport transfers", "Sightseeing by AC cab", "Tour escort"],
    exclusions: ["Flights", "Personal expenses", "Alcohol", "Adventure sports charges", "Room service"],
  },
  {
    id: 102,
    name: "Kashmir Paradise",
    destination: "Kashmir",
    type: "honeymoon",
    duration: "6D/5N",
    nights: 5,
    pricePerPerson: 32000,
    rating: 4.8,
    ratingCount: 1120,
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
      "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800&q=80",
      "https://images.unsplash.com/photo-1455156218388-5e61b526818b?w=800&q=80",
    ],
    highlights: ["Houseboat on Dal Lake", "Gulmarg Gondola", "Pahalgam Valley", "Shikara Ride", "Mughal Gardens"],
    description: "The paradise on Earth awaits you — snow-capped mountains, blooming gardens, and shimmering Dal Lake form the backdrop of your dream vacation.",
    inclusions: ["Houseboat accommodation", "All meals", "Shikara rides", "All transfers", "Sightseeing"],
    exclusions: ["Flights to/from Srinagar", "Gondola tickets", "Pony rides", "Personal expenses", "Travel insurance"],
  },
  {
    id: 103,
    name: "Kerala Backwaters & Hills",
    destination: "Kerala",
    type: "family",
    duration: "6D/5N",
    nights: 5,
    pricePerPerson: 22000,
    rating: 4.6,
    ratingCount: 2310,
    images: [
      "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&q=80",
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80",
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80",
    ],
    highlights: ["Houseboat on backwaters", "Munnar tea gardens", "Periyar Wildlife Sanctuary", "Ayurvedic spa", "Kathakali dance show"],
    description: "God's Own Country in all its glory — lush green hills, serene backwaters, spice-scented air, and unmatched Ayurvedic hospitality.",
    inclusions: ["Hotel + Houseboat stay", "Daily breakfast & dinner", "Houseboat meals", "AC transfers", "Wildlife safari"],
    exclusions: ["Flights", "Kathakali tickets", "Elephant rides", "Water sports", "Personal expenses"],
  },
  {
    id: 104,
    name: "Rajasthan Royal Tour",
    destination: "Rajasthan",
    type: "cultural",
    duration: "6D/5N",
    nights: 5,
    pricePerPerson: 28000,
    rating: 4.7,
    ratingCount: 1560,
    images: [
      "https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=800&q=80",
      "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&q=80",
      "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80",
    ],
    highlights: ["Amber Fort elephant ride", "Jaisalmer Desert Safari", "Sam Sand Dunes camp", "Heritage havelis", "Camel safari"],
    description: "Step into a royal world of majestic forts, golden deserts, and opulent palaces. Rajasthan's colours, culture, and cuisine will leave you spellbound.",
    inclusions: ["Heritage hotel stays", "Daily breakfast & dinner", "Elephant ride (Amber)", "Desert camp night", "All transfers"],
    exclusions: ["Flights", "Camel safari extra", "Museum entry fees", "Personal expenses", "Travel insurance"],
  },
  {
    id: 105,
    name: "Manali Adventure Escape",
    destination: "Manali",
    type: "adventure",
    duration: "5D/4N",
    nights: 4,
    pricePerPerson: 18000,
    rating: 4.4,
    ratingCount: 980,
    images: [
      "https://images.unsplash.com/photo-1587213811864-49e7b31bb862?w=800&q=80",
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    ],
    highlights: ["Rohtang Pass (snow)", "Solang Valley skiing", "River rafting", "Paragliding", "Hadimba Temple"],
    description: "For thrill-seekers and mountain lovers — rivers to raft, snowy peaks to climb, and misty valleys to explore in the majestic Himalayas.",
    inclusions: ["Mountain resort stay", "Daily breakfast & dinner", "Rohtang Pass permit", "River rafting", "All transfers"],
    exclusions: ["Flights/train to Manali", "Skiing equipment", "Paragliding charges", "Personal expenses", "Travel insurance"],
  },
  {
    id: 106,
    name: "Andaman Island Getaway",
    destination: "Andaman",
    type: "beach",
    duration: "5D/4N",
    nights: 4,
    pricePerPerson: 26000,
    rating: 4.6,
    ratingCount: 740,
    images: [
      "https://images.unsplash.com/photo-1562973597-2c63e0c1b1ad?w=800&q=80",
      "https://images.unsplash.com/photo-1500916434205-0c77489c6cf7?w=800&q=80",
      "https://images.unsplash.com/photo-1439405326854-014607f694d7?w=800&q=80",
    ],
    highlights: ["Radhanagar Beach (Asia's best)", "Cellular Jail", "Snorkeling & scuba diving", "Havelock Island", "Glass-bottom boat ride"],
    description: "Turquoise waters, white-sand beaches, and vibrant coral reefs — the Andaman Islands are India's best-kept tropical secret.",
    inclusions: ["Hotel + Eco Resort stay", "Daily breakfast", "Ferry tickets", "Island transfers", "Snorkeling gear"],
    exclusions: ["Flights to Port Blair", "Scuba diving charges", "Water sports", "Personal expenses", "Liquor"],
  },
  {
    id: 107,
    name: "Maldives Luxury Escape",
    destination: "Maldives",
    type: "luxury",
    duration: "5D/4N",
    nights: 4,
    pricePerPerson: 85000,
    rating: 4.9,
    ratingCount: 430,
    images: [
      "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800&q=80",
      "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80",
      "https://images.unsplash.com/photo-1540202403-b7abd6747a18?w=800&q=80",
    ],
    highlights: ["Overwater villa", "Private beach", "Sunset dolphin cruise", "Snorkeling & diving", "Spa treatments"],
    description: "Ultimate luxury in the middle of the Indian Ocean — private overwater villas, crystal-clear lagoons, and world-class dining await you.",
    inclusions: ["Overwater villa stay", "All meals (full board)", "Speedboat transfers", "Snorkeling", "Sunset cruise"],
    exclusions: ["International flights", "Scuba diving courses", "Spa (extra)", "Excursions not listed", "Travel insurance"],
  },
  {
    id: 108,
    name: "Shimla–Manali Honeymoon",
    destination: "Himachal Pradesh",
    type: "honeymoon",
    duration: "7D/6N",
    nights: 6,
    pricePerPerson: 24000,
    rating: 4.5,
    ratingCount: 860,
    images: [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
      "https://images.unsplash.com/photo-1445257508802-b52e6e13b1ae?w=800&q=80",
      "https://images.unsplash.com/photo-1553428811-8a8a6e32e86a?w=800&q=80",
    ],
    highlights: ["Mall Road Shimla", "Kufri snow valley", "Rohtang Pass", "Solang Valley", "Romantic candlelight dinner"],
    description: "The ultimate hill-station honeymoon — from colonial Shimla to adventurous Manali, paint your love story against a backdrop of snow peaks.",
    inclusions: ["Hotel stay (couple rooms)", "Daily breakfast & dinner", "All transfers", "Romantic dinner (1 night)", "Sightseeing"],
    exclusions: ["Flights/train", "Adventure sports", "Personal expenses", "Honeymoon suite upgrade", "Travel insurance"],
  },
];

export const PACKAGE_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  beach:     { label: "Beach",     color: "bg-blue-100 text-blue-700 border-blue-200" },
  adventure: { label: "Adventure", color: "bg-orange-100 text-orange-700 border-orange-200" },
  cultural:  { label: "Cultural",  color: "bg-purple-100 text-purple-700 border-purple-200" },
  luxury:    { label: "Luxury",    color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  family:    { label: "Family",    color: "bg-green-100 text-green-700 border-green-200" },
  honeymoon: { label: "Honeymoon", color: "bg-pink-100 text-pink-700 border-pink-200" },
  hill:      { label: "Hill",      color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  wildlife:  { label: "Wildlife",  color: "bg-teal-100 text-teal-700 border-teal-200" },
};

// ── Package audience (who the trip is for) ────────────────────────────────────
export const PACKAGE_AUDIENCE_LABELS: Record<string, { label: string; badge: string; color: string; icon: string }> = {
  honeymoon: { label: "Couples",       badge: "Honeymoon Special", color: "bg-pink-100 text-pink-700 border-pink-200",   icon: "💑" },
  family:    { label: "Family",        badge: "Family Friendly",   color: "bg-green-100 text-green-700 border-green-200", icon: "👨‍👩‍👧‍👦" },
  friends:   { label: "Friends",       badge: "Friends Trip",      color: "bg-blue-100 text-blue-700 border-blue-200",   icon: "👥" },
  budget:    { label: "Budget",        badge: "Budget Deal",       color: "bg-amber-100 text-amber-700 border-amber-200", icon: "💰" },
  luxury:    { label: "Luxury",        badge: "Luxury Escape",     color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: "👑" },
};
