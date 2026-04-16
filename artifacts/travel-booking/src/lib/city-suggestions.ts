import { BUS_CITIES } from "./bus-cities";

// Popular Indian cities and airports for autocomplete suggestions
export const citySuggestions = [
  // Major Metros
  { name: "Delhi",              airportName: "Indira Gandhi Intl",          code: "DEL", country: "India" },
  { name: "Mumbai",             airportName: "Chhatrapati Shivaji Maharaj Intl", code: "BOM", country: "India" },
  { name: "Bangalore",          airportName: "Kempegowda Intl",             code: "BLR", country: "India" },
  { name: "Kolkata",            airportName: "Netaji Subhas Chandra Bose Intl", code: "CCU", country: "India" },
  { name: "Chennai",            airportName: "Chennai Intl",                code: "MAA", country: "India" },
  { name: "Hyderabad",          airportName: "Rajiv Gandhi Intl",           code: "HYD", country: "India" },

  // Tourist Destinations
  { name: "Goa",                airportName: "Goa Intl (Dabolim)",          code: "GOI", country: "India" },
  { name: "Jaipur",             airportName: "Jaipur Intl",                 code: "JAI", country: "India" },
  { name: "Udaipur",            airportName: "Maharana Pratap Airport",     code: "UDR", country: "India" },
  { name: "Ahmedabad",          airportName: "Sardar Vallabhbhai Patel Intl", code: "AMD", country: "India" },
  { name: "Pune",               airportName: "Pune Airport",                code: "PNQ", country: "India" },
  { name: "Kochi",              airportName: "Cochin Intl",                 code: "COK", country: "India" },
  { name: "Thiruvananthapuram", airportName: "Trivandrum Intl",             code: "TRV", country: "India" },
  { name: "Coimbatore",         airportName: "Coimbatore Intl",             code: "CJB", country: "India" },

  // North India
  { name: "Lucknow",            airportName: "Chaudhary Charan Singh Intl", code: "LKO", country: "India" },
  { name: "Varanasi",           airportName: "Lal Bahadur Shastri Intl",   code: "VNS", country: "India" },
  { name: "Srinagar",           airportName: "Sheikh ul-Alam Intl",         code: "SXR", country: "India" },
  { name: "Leh",                airportName: "Kushok Bakula Rimpochee",     code: "IXL", country: "India" },
  { name: "Amritsar",           airportName: "Sri Guru Ram Dass Jee Intl",  code: "ATQ", country: "India" },
  { name: "Chandigarh",         airportName: "Chandigarh Intl",             code: "IXC", country: "India" },
  { name: "Dehradun",           airportName: "Jolly Grant Airport",         code: "DED", country: "India" },
  { name: "Shimla",             airportName: "Shimla Airport",              code: "SLV", country: "India" },
  { name: "Jammu",              airportName: "Jammu Airport",               code: "IXJ", country: "India" },

  // East India
  { name: "Bhubaneswar",        airportName: "Biju Patnaik Intl",          code: "BBI", country: "India" },
  { name: "Patna",              airportName: "Jay Prakash Narayan Intl",    code: "PAT", country: "India" },
  { name: "Guwahati",           airportName: "Lokpriya Gopinath Bordoloi",  code: "GAU", country: "India" },
  { name: "Ranchi",             airportName: "Birsa Munda Airport",         code: "IXR", country: "India" },
  { name: "Bagdogra",           airportName: "Bagdogra Airport",            code: "IXB", country: "India" },

  // South India
  { name: "Visakhapatnam",      airportName: "Visakhapatnam Airport",       code: "VTZ", country: "India" },
  { name: "Vijayawada",         airportName: "Vijayawada Intl",             code: "VGA", country: "India" },
  { name: "Mangalore",          airportName: "Mangalore Intl",              code: "IXE", country: "India" },
  { name: "Madurai",            airportName: "Madurai Airport",             code: "IXM", country: "India" },
  { name: "Trichy",             airportName: "Tiruchirappalli Intl",        code: "TRZ", country: "India" },
  { name: "Tirupati",           airportName: "Tirupati Airport",            code: "TIR", country: "India" },

  // West India
  { name: "Indore",             airportName: "Devi Ahilyabai Holkar Intl",  code: "IDR", country: "India" },
  { name: "Nagpur",             airportName: "Dr. Babasaheb Ambedkar Intl", code: "NAG", country: "India" },
  { name: "Surat",              airportName: "Surat Airport",               code: "STV", country: "India" },
  { name: "Vadodara",           airportName: "Vadodara Airport",            code: "BDQ", country: "India" },
  { name: "Jodhpur",            airportName: "Jodhpur Airport",             code: "JDH", country: "India" },
  { name: "Rajkot",             airportName: "Rajkot Airport",              code: "RAJ", country: "India" },

  // Central India
  { name: "Bhopal",             airportName: "Raja Bhoj Airport",           code: "BHO", country: "India" },
  { name: "Raipur",             airportName: "Swami Vivekananda Airport",   code: "RPR", country: "India" },
  { name: "Aurangabad",         airportName: "Aurangabad Airport",          code: "IXU", country: "India" },

  // Island Destinations
  { name: "Port Blair",         airportName: "Veer Savarkar Intl",          code: "IXZ", country: "India" },
  { name: "Agatti Island",      airportName: "Agatti Airport",              code: "AGX", country: "India" },

  // International – Middle East
  { name: "Dubai",              airportName: "Dubai Intl",                  code: "DXB", country: "UAE" },
  { name: "Abu Dhabi",          airportName: "Abu Dhabi Intl",              code: "AUH", country: "UAE" },
  { name: "Sharjah",            airportName: "Sharjah Intl",                code: "SHJ", country: "UAE" },
  { name: "Doha",               airportName: "Hamad Intl",                  code: "DOH", country: "Qatar" },
  { name: "Riyadh",             airportName: "King Khalid Intl",            code: "RUH", country: "Saudi Arabia" },
  { name: "Muscat",             airportName: "Muscat Intl",                 code: "MCT", country: "Oman" },
  { name: "Bahrain",            airportName: "Bahrain Intl",                code: "BAH", country: "Bahrain" },
  { name: "Kuwait",             airportName: "Kuwait Intl",                 code: "KWI", country: "Kuwait" },

  // International – Southeast Asia
  { name: "Singapore",          airportName: "Changi Airport",              code: "SIN", country: "Singapore" },
  { name: "Bangkok",            airportName: "Suvarnabhumi Intl",           code: "BKK", country: "Thailand" },
  { name: "Kuala Lumpur",       airportName: "KL Intl (KLIA)",              code: "KUL", country: "Malaysia" },
  { name: "Jakarta",            airportName: "Soekarno-Hatta Intl",         code: "CGK", country: "Indonesia" },
  { name: "Manila",             airportName: "Ninoy Aquino Intl",           code: "MNL", country: "Philippines" },
  { name: "Phuket",             airportName: "Phuket Intl",                 code: "HKT", country: "Thailand" },
  { name: "Bali",               airportName: "Ngurah Rai Intl",             code: "DPS", country: "Indonesia" },

  // International – East Asia
  { name: "Hong Kong",          airportName: "Hong Kong Intl",              code: "HKG", country: "Hong Kong" },
  { name: "Tokyo",              airportName: "Narita Intl",                 code: "NRT", country: "Japan" },
  { name: "Beijing",            airportName: "Capital Intl",                code: "PEK", country: "China" },
  { name: "Seoul",              airportName: "Incheon Intl",                code: "ICN", country: "South Korea" },

  // International – South Asia
  { name: "Colombo",            airportName: "Bandaranaike Intl",           code: "CMB", country: "Sri Lanka" },
  { name: "Kathmandu",          airportName: "Tribhuvan Intl",              code: "KTM", country: "Nepal" },
  { name: "Dhaka",              airportName: "Hazrat Shahjalal Intl",       code: "DAC", country: "Bangladesh" },
  { name: "Male",               airportName: "Velana Intl",                 code: "MLE", country: "Maldives" },

  // International – Europe & Americas
  { name: "London",             airportName: "Heathrow Airport",            code: "LHR", country: "UK" },
  { name: "Frankfurt",          airportName: "Frankfurt Airport",           code: "FRA", country: "Germany" },
  { name: "Paris",              airportName: "Charles de Gaulle",           code: "CDG", country: "France" },
  { name: "Amsterdam",          airportName: "Amsterdam Airport Schiphol",  code: "AMS", country: "Netherlands" },
  { name: "New York",           airportName: "JFK Intl",                    code: "JFK", country: "USA" },
  { name: "San Francisco",      airportName: "San Francisco Intl",          code: "SFO", country: "USA" },
  { name: "Toronto",            airportName: "Pearson Intl",                code: "YYZ", country: "Canada" },
  { name: "Sydney",             airportName: "Kingsford Smith Intl",        code: "SYD", country: "Australia" },
  { name: "Melbourne",          airportName: "Melbourne Airport",           code: "MEL", country: "Australia" },
];

// For bus search — derived from BUS_CITIES (state-aware, no airport codes)
export const busCitySuggestions = BUS_CITIES.map((c) => ({
  name: c.name,
  state: c.state,
  country: "India",
}));

// For hotel search — cities and hotel brands
// code field = the city to actually search (used when user selects a hotel brand)
// airportName field = sub-label shown in dropdown (hotel brand type or area)
export const hotelCitySuggestions = [
  // Major Metros
  { name: "Mumbai",        country: "India" },
  { name: "Delhi",         country: "India" },
  { name: "Bangalore",     country: "India" },
  { name: "Kolkata",       country: "India" },
  { name: "Chennai",       country: "India" },
  { name: "Hyderabad",     country: "India" },
  // Tourist Cities
  { name: "Goa",           country: "India" },
  { name: "Jaipur",        country: "India" },
  { name: "Udaipur",       country: "India" },
  { name: "Pune",          country: "India" },
  { name: "Kochi",         country: "India" },
  { name: "Ahmedabad",     country: "India" },
  { name: "Shimla",        country: "India" },
  { name: "Manali",        country: "India" },
  { name: "Rishikesh",     country: "India" },
  { name: "Varanasi",      country: "India" },
  { name: "Agra",          country: "India" },
  { name: "Jodhpur",       country: "India" },
  { name: "Mysore",        country: "India" },
  { name: "Ooty",          country: "India" },
  { name: "Darjeeling",    country: "India" },
  { name: "Amritsar",      country: "India" },
  { name: "Pondicherry",   country: "India" },
  { name: "Alleppey",      country: "India" },
  { name: "Munnar",        country: "India" },
  { name: "Coorg",         country: "India" },
  { name: "Mount Abu",     country: "India" },
  { name: "Nainital",      country: "India" },
  { name: "Mussoorie",     country: "India" },
  { name: "Visakhapatnam", country: "India" },
  { name: "Tirupati",      country: "India" },
  { name: "Madurai",       country: "India" },
  { name: "Coimbatore",    country: "India" },
  { name: "Srinagar",      country: "India" },
  { name: "Leh",           country: "India" },
  { name: "Chandigarh",    country: "India" },
  { name: "Lucknow",       country: "India" },
  { name: "Patna",         country: "India" },
  { name: "Bhubaneswar",   country: "India" },
  { name: "Guwahati",      country: "India" },
  { name: "Indore",        country: "India" },
  { name: "Nagpur",        country: "India" },
  { name: "Bhopal",        country: "India" },
  { name: "Raipur",        country: "India" },
  // International
  { name: "Dubai",         country: "UAE" },
  { name: "Singapore",     country: "Singapore" },
  { name: "Bangkok",       country: "Thailand" },
  { name: "Bali",          country: "Indonesia" },
  { name: "Phuket",        country: "Thailand" },
  { name: "Kuala Lumpur",  country: "Malaysia" },
  { name: "Maldives",      country: "Maldives" },
  { name: "London",        country: "UK" },
  { name: "Paris",         country: "France" },
  { name: "New York",      country: "USA" },
  { name: "Tokyo",         country: "Japan" },
  { name: "Sydney",        country: "Australia" },
  // ── Hotel Brand suggestions (code = city to search, airportName = brand label) ──
  { name: "Taj Hotels",              code: "Mumbai",    airportName: "Taj Mahal Palace, Taj Exotica, Taj Falaknuma", country: "India" },
  { name: "Taj Falaknuma Palace",    code: "Hyderabad", airportName: "Heritage palace hotel · Hyderabad",           country: "India" },
  { name: "Taj Exotica Resort",      code: "Goa",       airportName: "Beachfront luxury resort · Goa",              country: "India" },
  { name: "Taj Bengal",              code: "Kolkata",   airportName: "Iconic Taj property · Kolkata",               country: "India" },
  { name: "Taj Malabar Resort",      code: "Kochi",     airportName: "Backwater resort · Kochi",                    country: "India" },
  { name: "Novotel Hotels",          code: "Hyderabad", airportName: "Novotel Convention Centre · Hyderabad",       country: "India" },
  { name: "Novotel Juhu Beach",      code: "Mumbai",    airportName: "Beachfront Novotel · Mumbai",                 country: "India" },
  { name: "Novotel Bengaluru",       code: "Bangalore", airportName: "Novotel Tech Park · Whitefield, Bangalore",   country: "India" },
  { name: "ITC Hotels",              code: "Mumbai",    airportName: "ITC Grand Central, ITC Kohenur, ITC Windsor", country: "India" },
  { name: "ITC Grand Chola",         code: "Chennai",   airportName: "Luxury ITC property · Chennai",               country: "India" },
  { name: "ITC Kohenur",             code: "Hyderabad", airportName: "Luxury hotel · HITEC City, Hyderabad",        country: "India" },
  { name: "ITC Royal Bengal",        code: "Kolkata",   airportName: "India's tallest hotel · Kolkata",             country: "India" },
  { name: "Oberoi Hotels",           code: "Delhi",     airportName: "The Oberoi, Oberoi Grand, Oberoi Rajvilas",   country: "India" },
  { name: "The Oberoi Grand",        code: "Kolkata",   airportName: "Victorian heritage hotel · Kolkata",          country: "India" },
  { name: "The Oberoi Rajvilas",     code: "Jaipur",    airportName: "Luxury villa resort · Jaipur",                country: "India" },
  { name: "Marriott Hotels",         code: "Mumbai",    airportName: "JW Marriott, Courtyard, Westin brands",       country: "India" },
  { name: "JW Marriott Mumbai",      code: "Mumbai",    airportName: "5-star JW Marriott · Juhu, Mumbai",           country: "India" },
  { name: "JW Marriott Bengaluru",   code: "Bangalore", airportName: "Urban luxury · Vittal Mallya Road",           country: "India" },
  { name: "JW Marriott Pune",        code: "Pune",      airportName: "Award-winning hotel · Pune",                  country: "India" },
  { name: "Hyatt Hotels",            code: "Hyderabad", airportName: "Park Hyatt, Grand Hyatt, Hyatt Regency",      country: "India" },
  { name: "Park Hyatt Hyderabad",    code: "Hyderabad", airportName: "Luxury hotel · Banjara Hills",                country: "India" },
  { name: "Park Hyatt Goa",          code: "Goa",       airportName: "Beachfront luxury · South Goa",              country: "India" },
  { name: "Grand Hyatt Goa",         code: "Goa",       airportName: "Resort with free-form pool · North Goa",     country: "India" },
  { name: "Radisson Blu Hotels",     code: "Delhi",     airportName: "Radisson Blu properties across India",        country: "India" },
  { name: "Leela Hotels",            code: "Delhi",     airportName: "The Leela Palace, Leela Ambience",            country: "India" },
  { name: "The Leela Palace Delhi",  code: "Delhi",     airportName: "Palace hotel · Chanakyapuri",                 country: "India" },
  { name: "The Leela Bengaluru",     code: "Bangalore", airportName: "Palace hotel · Old Airport Road",             country: "India" },
  { name: "Rambagh Palace",          code: "Jaipur",    airportName: "Maharaja's palace hotel · Jaipur",            country: "India" },
  { name: "Trident Hotels",          code: "Mumbai",    airportName: "Trident BKC, Trident Jaipur",                 country: "India" },
  { name: "Sheraton Hotels",         code: "Delhi",     airportName: "Sheraton New Delhi · Saket",                  country: "India" },
  { name: "Lemon Tree Hotels",       code: "Delhi",     airportName: "Budget-premium brand across India",           country: "India" },
  { name: "Ibis Hotels",             code: "Bangalore", airportName: "Smart budget hotel · Bangalore",              country: "India" },
  { name: "Conrad Hotels",           code: "Pune",      airportName: "Hilton luxury brand · Pune",                  country: "India" },
];

// Popular package destinations
export const packageDestinations = [
  { name: "Goa", country: "India" },
  { name: "Kerala", country: "India" },
  { name: "Rajasthan", country: "India" },
  { name: "Kashmir", country: "India" },
  { name: "Himachal Pradesh", country: "India" },
  { name: "Uttarakhand", country: "India" },
  { name: "Andaman & Nicobar", country: "India" },
  { name: "Lakshadweep", country: "India" },
  { name: "Ladakh", country: "India" },
  { name: "Northeast India", country: "India" },
  { name: "Golden Triangle", country: "India" },
  { name: "South India", country: "India" },
];
