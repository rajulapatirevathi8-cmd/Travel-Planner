// Comprehensive country calling codes for phone number input
export const countryCodes = [
  // Popular countries first
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+1", country: "United States", flag: "🇺🇸" },
  { code: "+44", country: "United Kingdom", flag: "🇬🇧" },
  { code: "+61", country: "Australia", flag: "🇦🇺" },
  { code: "+1", country: "Canada", flag: "🇨🇦" },
  { code: "+65", country: "Singapore", flag: "🇸🇬" },
  { code: "+971", country: "UAE", flag: "🇦🇪" },
  
  // Asian countries
  { code: "+93", country: "Afghanistan", flag: "🇦🇫" },
  { code: "+880", country: "Bangladesh", flag: "🇧🇩" },
  { code: "+975", country: "Bhutan", flag: "🇧🇹" },
  { code: "+673", country: "Brunei", flag: "🇧🇳" },
  { code: "+855", country: "Cambodia", flag: "🇰🇭" },
  { code: "+86", country: "China", flag: "🇨🇳" },
  { code: "+852", country: "Hong Kong", flag: "🇭🇰" },
  { code: "+62", country: "Indonesia", flag: "🇮🇩" },
  { code: "+81", country: "Japan", flag: "🇯🇵" },
  { code: "+82", country: "South Korea", flag: "🇰🇷" },
  { code: "+856", country: "Laos", flag: "🇱🇦" },
  { code: "+853", country: "Macao", flag: "🇲🇴" },
  { code: "+60", country: "Malaysia", flag: "🇲🇾" },
  { code: "+960", country: "Maldives", flag: "🇲🇻" },
  { code: "+976", country: "Mongolia", flag: "🇲🇳" },
  { code: "+95", country: "Myanmar", flag: "🇲🇲" },
  { code: "+977", country: "Nepal", flag: "🇳🇵" },
  { code: "+92", country: "Pakistan", flag: "🇵🇰" },
  { code: "+63", country: "Philippines", flag: "🇵🇭" },
  { code: "+94", country: "Sri Lanka", flag: "🇱🇰" },
  { code: "+886", country: "Taiwan", flag: "🇹🇼" },
  { code: "+66", country: "Thailand", flag: "🇹🇭" },
  { code: "+84", country: "Vietnam", flag: "🇻🇳" },
  
  // Middle East
  { code: "+973", country: "Bahrain", flag: "🇧🇭" },
  { code: "+20", country: "Egypt", flag: "🇪🇬" },
  { code: "+98", country: "Iran", flag: "🇮🇷" },
  { code: "+964", country: "Iraq", flag: "🇮🇶" },
  { code: "+972", country: "Israel", flag: "🇮🇱" },
  { code: "+962", country: "Jordan", flag: "🇯🇴" },
  { code: "+965", country: "Kuwait", flag: "🇰🇼" },
  { code: "+961", country: "Lebanon", flag: "🇱🇧" },
  { code: "+968", country: "Oman", flag: "🇴🇲" },
  { code: "+974", country: "Qatar", flag: "🇶🇦" },
  { code: "+966", country: "Saudi Arabia", flag: "🇸🇦" },
  { code: "+90", country: "Turkey", flag: "🇹🇷" },
  { code: "+967", country: "Yemen", flag: "🇾🇪" },
  
  // Europe
  { code: "+355", country: "Albania", flag: "🇦🇱" },
  { code: "+43", country: "Austria", flag: "🇦🇹" },
  { code: "+32", country: "Belgium", flag: "🇧🇪" },
  { code: "+359", country: "Bulgaria", flag: "🇧🇬" },
  { code: "+385", country: "Croatia", flag: "🇭🇷" },
  { code: "+357", country: "Cyprus", flag: "🇨🇾" },
  { code: "+420", country: "Czech Republic", flag: "🇨🇿" },
  { code: "+45", country: "Denmark", flag: "🇩🇰" },
  { code: "+372", country: "Estonia", flag: "🇪🇪" },
  { code: "+358", country: "Finland", flag: "🇫🇮" },
  { code: "+33", country: "France", flag: "🇫🇷" },
  { code: "+49", country: "Germany", flag: "🇩🇪" },
  { code: "+30", country: "Greece", flag: "🇬🇷" },
  { code: "+36", country: "Hungary", flag: "🇭🇺" },
  { code: "+354", country: "Iceland", flag: "🇮🇸" },
  { code: "+353", country: "Ireland", flag: "🇮🇪" },
  { code: "+39", country: "Italy", flag: "🇮🇹" },
  { code: "+371", country: "Latvia", flag: "🇱🇻" },
  { code: "+370", country: "Lithuania", flag: "🇱🇹" },
  { code: "+352", country: "Luxembourg", flag: "🇱🇺" },
  { code: "+356", country: "Malta", flag: "🇲🇹" },
  { code: "+31", country: "Netherlands", flag: "🇳🇱" },
  { code: "+47", country: "Norway", flag: "🇳🇴" },
  { code: "+48", country: "Poland", flag: "🇵🇱" },
  { code: "+351", country: "Portugal", flag: "🇵🇹" },
  { code: "+40", country: "Romania", flag: "🇷🇴" },
  { code: "+7", country: "Russia", flag: "🇷🇺" },
  { code: "+381", country: "Serbia", flag: "🇷🇸" },
  { code: "+421", country: "Slovakia", flag: "🇸🇰" },
  { code: "+386", country: "Slovenia", flag: "🇸🇮" },
  { code: "+34", country: "Spain", flag: "🇪🇸" },
  { code: "+46", country: "Sweden", flag: "🇸🇪" },
  { code: "+41", country: "Switzerland", flag: "🇨🇭" },
  { code: "+380", country: "Ukraine", flag: "🇺🇦" },
  
  // Americas
  { code: "+54", country: "Argentina", flag: "🇦🇷" },
  { code: "+55", country: "Brazil", flag: "🇧🇷" },
  { code: "+56", country: "Chile", flag: "🇨🇱" },
  { code: "+57", country: "Colombia", flag: "🇨🇴" },
  { code: "+506", country: "Costa Rica", flag: "🇨🇷" },
  { code: "+53", country: "Cuba", flag: "🇨🇺" },
  { code: "+1-809", country: "Dominican Republic", flag: "🇩🇴" },
  { code: "+593", country: "Ecuador", flag: "🇪🇨" },
  { code: "+52", country: "Mexico", flag: "🇲🇽" },
  { code: "+51", country: "Peru", flag: "🇵🇪" },
  { code: "+58", country: "Venezuela", flag: "🇻🇪" },
  
  // Africa
  { code: "+213", country: "Algeria", flag: "🇩🇿" },
  { code: "+244", country: "Angola", flag: "🇦🇴" },
  { code: "+251", country: "Ethiopia", flag: "🇪🇹" },
  { code: "+233", country: "Ghana", flag: "🇬🇭" },
  { code: "+254", country: "Kenya", flag: "🇰🇪" },
  { code: "+212", country: "Morocco", flag: "🇲🇦" },
  { code: "+234", country: "Nigeria", flag: "🇳🇬" },
  { code: "+27", country: "South Africa", flag: "🇿🇦" },
  { code: "+255", country: "Tanzania", flag: "🇹🇿" },
  { code: "+216", country: "Tunisia", flag: "🇹🇳" },
  { code: "+256", country: "Uganda", flag: "🇺🇬" },
  
  // Oceania
  { code: "+679", country: "Fiji", flag: "🇫🇯" },
  { code: "+64", country: "New Zealand", flag: "🇳🇿" },
  { code: "+675", country: "Papua New Guinea", flag: "🇵🇬" },
];

export const defaultCountryCode = "+91"; // India as default

// Helper function to search country codes
export function searchCountryCodes(query: string) {
  if (!query) return countryCodes;
  
  const lowerQuery = query.toLowerCase();
  return countryCodes.filter(
    (country) =>
      country.country.toLowerCase().includes(lowerQuery) ||
      country.code.includes(query)
  );
}
