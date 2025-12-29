
export const APP_NAME = "दृष्टि खबर";

export const CATEGORIES = [
  { id: 'politics', label: 'राजनीति' },
  { id: 'society', label: 'समाज' },
  { id: 'economy', label: 'अर्थतन्त्र' },
  { id: 'sports', label: 'खेलकुद' },
  { id: 'education', label: 'शिक्षा' },
  { id: 'health', label: 'स्वास्थ्य' },
  { id: 'tech', label: 'प्रविधि' },
  { id: 'international', label: 'अन्तर्राष्ट्रिय' },
];

export const NEPALI_MONTHS = [
  'बैशाख', 'जेठ', 'असार', 'साउन', 'भदौ', 'असोज',
  'कात्तिक', 'मंसिर', 'पुष', 'माघ', 'फागुन', 'चैत'
];

export const NEPALI_DAYS = [
  'आईतबार', 'सोमबार', 'मंगलबार', 'बुधबार', 'बिहिबार', 'शुक्रबार', 'शनिबार'
];

export const NEPALI_NUMERALS: Record<string, string> = {
  '0': '०', '1': '१', '2': '२', '3': '३', '4': '४',
  '5': '५', '6': '६', '7': '७', '8': '८', '9': '९'
};

export function toNepaliNumeral(num: number | string): string {
  return num.toString().split('').map(d => NEPALI_NUMERALS[d] || d).join('');
}
