export interface BusCity {
  name: string;
  state: string;
  boardingPoints: string[];
  droppingPoints: string[];
}

export const BUS_CITIES: BusCity[] = [
  {
    name: "Hyderabad",
    state: "Telangana",
    boardingPoints: [
      "Ameerpet",
      "KPHB Colony",
      "LB Nagar",
      "MGBS (Imlibun)",
      "Uppal",
      "Kukatpally",
      "Dilsukhnagar",
      "SR Nagar",
      "Secunderabad",
    ],
    droppingPoints: [
      "MGBS (Imlibun)",
      "Koti",
      "Tarnaka",
      "Uppal X Roads",
      "LB Nagar",
      "Dilsukhnagar",
      "Secunderabad",
    ],
  },
  {
    name: "Vijayawada",
    state: "Andhra Pradesh",
    boardingPoints: [
      "Pandit Nehru Bus Station",
      "Benz Circle",
      "One Town",
      "Gunadala",
      "Auto Nagar",
      "Machavaram",
    ],
    droppingPoints: [
      "Pandit Nehru Bus Station",
      "Benz Circle",
      "Auto Nagar",
      "Machavaram",
      "One Town",
    ],
  },
  {
    name: "Bangalore",
    state: "Karnataka",
    boardingPoints: [
      "Majestic (Kempegowda Bus Terminal)",
      "Silk Board",
      "Marathahalli",
      "Electronic City",
      "Hebbal",
      "Kalasipalya",
      "Shantinagar",
      "K R Market",
    ],
    droppingPoints: [
      "Majestic (Kempegowda Bus Terminal)",
      "Silk Board",
      "Koramangala",
      "Whitefield",
      "Hebbal",
      "Yeshwanthpur",
    ],
  },
  {
    name: "Chennai",
    state: "Tamil Nadu",
    boardingPoints: [
      "Koyambedu",
      "Chennai Central",
      "Tambaram",
      "Tidel Park",
      "Guindy",
      "Perungudi",
      "Broadway",
    ],
    droppingPoints: [
      "Koyambedu",
      "Broadway",
      "Chennai Central",
      "Tambaram",
      "Guindy",
    ],
  },
  {
    name: "Mumbai",
    state: "Maharashtra",
    boardingPoints: [
      "Dadar",
      "Borivali",
      "Thane",
      "Kurla",
      "Sion",
      "Panvel",
      "Vashi",
    ],
    droppingPoints: [
      "Dadar",
      "Borivali",
      "Thane",
      "Kurla",
      "Panvel",
    ],
  },
  {
    name: "Goa",
    state: "Goa",
    boardingPoints: [
      "Panaji Bus Stand",
      "Mapusa",
      "Margao",
      "Vasco da Gama",
      "Calangute",
      "Ponda",
    ],
    droppingPoints: [
      "Panaji Bus Stand",
      "Mapusa",
      "Margao",
      "Vasco da Gama",
    ],
  },
  {
    name: "Tirupati",
    state: "Andhra Pradesh",
    boardingPoints: [
      "Tirupati Bus Stand",
      "Renigunta",
      "Alipiri",
      "Tirumala",
    ],
    droppingPoints: [
      "Tirupati Bus Stand",
      "Renigunta",
      "Alipiri",
    ],
  },
  {
    name: "Visakhapatnam",
    state: "Andhra Pradesh",
    boardingPoints: [
      "RTC Complex",
      "MVP Colony",
      "Gajuwaka",
      "Steel Plant",
      "Dwaraka Nagar",
      "Madhurawada",
    ],
    droppingPoints: [
      "RTC Complex",
      "Dwaraka Nagar",
      "Steel Plant",
      "Madhurawada",
      "MVP Colony",
    ],
  },
  {
    name: "Guntur",
    state: "Andhra Pradesh",
    boardingPoints: [
      "Guntur Bus Stand",
      "Brodipet",
      "Arundelpet",
      "Nallapadu",
    ],
    droppingPoints: [
      "Guntur Bus Stand",
      "Brodipet",
      "Nallapadu",
    ],
  },
  {
    name: "Warangal",
    state: "Telangana",
    boardingPoints: [
      "Warangal Bus Stand",
      "Kazipet",
      "Hanamkonda",
      "Hunter Road",
    ],
    droppingPoints: [
      "Warangal Bus Stand",
      "Kazipet",
      "Hanamkonda",
    ],
  },
  {
    name: "Rajahmundry",
    state: "Andhra Pradesh",
    boardingPoints: [
      "Rajahmundry Bus Stand",
      "Danavaipeta",
      "Innespeta",
      "Bommuru",
    ],
    droppingPoints: [
      "Rajahmundry Bus Stand",
      "Danavaipeta",
      "Bommuru",
    ],
  },
  {
    name: "Nellore",
    state: "Andhra Pradesh",
    boardingPoints: [
      "Nellore Bus Stand",
      "GT Road",
      "Vedayapalem",
    ],
    droppingPoints: [
      "Nellore Bus Stand",
      "GT Road",
    ],
  },
  {
    name: "Kurnool",
    state: "Andhra Pradesh",
    boardingPoints: [
      "Kurnool Bus Stand",
      "Old Town",
      "Budhawarpet",
    ],
    droppingPoints: [
      "Kurnool Bus Stand",
      "Old Town",
    ],
  },
  {
    name: "Kakinada",
    state: "Andhra Pradesh",
    boardingPoints: [
      "Kakinada Bus Stand",
      "Jagannaickpur",
      "Main Road",
    ],
    droppingPoints: [
      "Kakinada Bus Stand",
      "Main Road",
    ],
  },
  {
    name: "Pune",
    state: "Maharashtra",
    boardingPoints: [
      "Shivajinagar",
      "Swargate",
      "Hadapsar",
      "Katraj",
      "Wakad",
      "Hinjewadi",
    ],
    droppingPoints: [
      "Shivajinagar",
      "Swargate",
      "Hadapsar",
      "Katraj",
    ],
  },
  {
    name: "Coimbatore",
    state: "Tamil Nadu",
    boardingPoints: [
      "Gandhipuram",
      "Ukkadam",
      "RS Puram",
      "Singanallur",
    ],
    droppingPoints: [
      "Gandhipuram",
      "Ukkadam",
      "Singanallur",
    ],
  },
  {
    name: "Madurai",
    state: "Tamil Nadu",
    boardingPoints: [
      "Mattuthavani",
      "Periyar Bus Stand",
      "Arappalayam",
    ],
    droppingPoints: [
      "Mattuthavani",
      "Periyar Bus Stand",
    ],
  },
  {
    name: "Trichy",
    state: "Tamil Nadu",
    boardingPoints: [
      "Central Bus Stand",
      "Chatram Bus Stand",
      "Thillai Nagar",
    ],
    droppingPoints: [
      "Central Bus Stand",
      "Chatram Bus Stand",
    ],
  },
  {
    name: "Salem",
    state: "Tamil Nadu",
    boardingPoints: [
      "New Bus Stand",
      "Old Bus Stand",
      "Shevapet",
    ],
    droppingPoints: [
      "New Bus Stand",
      "Old Bus Stand",
    ],
  },
  {
    name: "Mysore",
    state: "Karnataka",
    boardingPoints: [
      "Central Bus Stand",
      "Suburban Bus Stand",
      "Hebbal",
      "Nazarbad",
    ],
    droppingPoints: [
      "Central Bus Stand",
      "Suburban Bus Stand",
      "Hebbal",
    ],
  },
  {
    name: "Mangalore",
    state: "Karnataka",
    boardingPoints: [
      "KSRTC Bus Stand",
      "Lalbagh",
      "Hampankatta",
    ],
    droppingPoints: [
      "KSRTC Bus Stand",
      "Lalbagh",
    ],
  },
  {
    name: "Hubli",
    state: "Karnataka",
    boardingPoints: [
      "Hubli Bus Stand",
      "Dharwad",
      "Vidyanagar",
    ],
    droppingPoints: [
      "Hubli Bus Stand",
      "Dharwad",
    ],
  },
];

export function getBusCityByName(name: string): BusCity | undefined {
  const q = name.toLowerCase().split(",")[0].trim();
  return BUS_CITIES.find(
    (c) => c.name.toLowerCase() === q || c.name.toLowerCase().startsWith(q)
  );
}

export function getBoardingPoints(cityName: string): string[] {
  const city = getBusCityByName(cityName);
  return city?.boardingPoints ?? [];
}

export function getDroppingPoints(cityName: string): string[] {
  const city = getBusCityByName(cityName);
  return city?.droppingPoints ?? [];
}
