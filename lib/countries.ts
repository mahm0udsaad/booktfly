const iataToCountry: Record<string, string> = {
  // Saudi Arabia
  'JED': 'sa', 'RUH': 'sa', 'MED': 'sa', 'DMM': 'sa', 'AHB': 'sa', 'TIF': 'sa', 'ELQ': 'sa',
  // UAE
  'DXB': 'ae', 'AUH': 'ae', 'SHJ': 'ae', 'DWC': 'ae', 'FJR': 'ae',
  // Egypt
  'CAI': 'eg', 'HBE': 'eg', 'SSH': 'eg', 'HRG': 'eg', 'LXR': 'eg',
  // Qatar
  'DOH': 'qa',
  // Kuwait
  'KWI': 'kw',
  // Bahrain
  'BAH': 'bh',
  // Oman
  'MCT': 'om', 'SLL': 'om',
  // Jordan
  'AMM': 'jo', 'AQJ': 'jo',
  // Turkey
  'IST': 'tr', 'SAW': 'tr', 'ESB': 'tr', 'AYT': 'tr',
  // Morocco
  'CMN': 'ma', 'RAK': 'ma', 'AGA': 'ma', 'FEZ': 'ma',
  // UK
  'LHR': 'gb', 'LGW': 'gb',
  // France
  'CDG': 'fr', 'ORY': 'fr',
  // Italy
  'FCO': 'it', 'MXP': 'it',
  // Germany
  'FRA': 'de', 'MUC': 'de',
  // USA
  'JFK': 'us', 'LAX': 'us', 'ORD': 'us',
}

const cityToCountry: Record<string, string> = {
  // Saudi
  'jeddah': 'sa', 'riyadh': 'sa', 'madinah': 'sa', 'dammam': 'sa', 'abha': 'sa', 'taif': 'sa',
  'جدة': 'sa', 'الرياض': 'sa', 'المدينة': 'sa', 'المدينة المنورة': 'sa', 'الدمام': 'sa', 'أبها': 'sa',
  // UAE
  'dubai': 'ae', 'abu dhabi': 'ae', 'sharjah': 'ae',
  'دبي': 'ae', 'أبو ظبي': 'ae', 'أبوظبي': 'ae', 'الشارقة': 'ae',
  // Egypt
  'cairo': 'eg', 'alexandria': 'eg', 'sharm el sheikh': 'eg',
  'القاهرة': 'eg', 'الاسكندرية': 'eg', 'الإسكندرية': 'eg', 'شرم الشيخ': 'eg',
  // Qatar
  'doha': 'qa', 'الدوحة': 'qa',
  // Kuwait
  'kuwait': 'kw', 'kuwait city': 'kw', 'الكويت': 'kw',
  // Bahrain
  'manama': 'bh', 'bahrain': 'bh', 'المنامة': 'bh', 'البحرين': 'bh',
  // Oman
  'muscat': 'om', 'مسقط': 'om',
  // Jordan
  'amman': 'jo', 'عمان': 'jo', 'عمّان': 'jo',
  // Turkey
  'istanbul': 'tr', 'ankara': 'tr', 'اسطنبول': 'tr', 'إسطنبول': 'tr', 'أنقرة': 'tr',
}

/**
 * Attempts to find a country code based on IATA code or City Name
 */
export function getCountryCode(iataCode?: string | null, cityName?: string | null): string | null {
  if (iataCode) {
    const code = iataCode.toUpperCase();
    if (iataToCountry[code]) return iataToCountry[code];
  }
  
  if (cityName) {
    const city = cityName.toLowerCase().trim();
    if (cityToCountry[city]) return cityToCountry[city];
  }
  
  return null;
}
