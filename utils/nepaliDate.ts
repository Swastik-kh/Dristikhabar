
import { NEPALI_MONTHS, NEPALI_DAYS, toNepaliNumeral } from '../constants';

/**
 * Accurate Bikram Sambat (BS) converter with precise month lengths for current years.
 * Data sourced from official Nepal Government calendars.
 */

// Official month lengths for accuracy
const monthDaysLookup: Record<number, number[]> = {
  2080: [31, 32, 31, 31, 31, 31, 30, 29, 30, 29, 30, 30], // 365 days
  2081: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30], // 366 days
  2082: [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30], // 365 days
  2083: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2084: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  2085: [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
};

// Precise Anchor: 2081 Baisakh 1 = 2024 April 13
const anchorBS = { year: 2081, month: 1, day: 1 };
const anchorAD = new Date(2024, 3, 13); // April is 3

/**
 * Returns today's date in YYYY-MM-DD format based on Nepal Standard Time (UTC+5:45).
 */
export function getNepalLocalDateString(): string {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000); // Convert to UTC in milliseconds
  const nepalTime = new Date(utc + (345 * 60000)); // Add 5 hours 45 minutes for NPT

  const year = nepalTime.getFullYear();
  const month = (nepalTime.getMonth() + 1).toString().padStart(2, '0');
  const day = nepalTime.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function getCurrentNepaliDate() {
  const now = new Date();
  
  // Local time adjustment (Nepal is UTC+5:45)
  // Since the environment provides local time, we just use the current Date object.
  
  const diffTime = now.getTime() - anchorAD.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  let currentYear = anchorBS.year;
  let currentMonth = anchorBS.month;
  let currentDay = anchorBS.day;

  let remainingDays = diffDays;

  if (remainingDays >= 0) {
    while (remainingDays > 0) {
      const yearDays = monthDaysLookup[currentYear] || monthDaysLookup[2081];
      const daysInMonth = yearDays[currentMonth - 1];

      if (remainingDays >= daysInMonth - currentDay + 1) {
        remainingDays -= (daysInMonth - currentDay + 1);
        currentDay = 1;
        currentMonth++;
        if (currentMonth > 12) {
          currentMonth = 1;
          currentYear++;
        }
      } else {
        currentDay += remainingDays;
        remainingDays = 0;
      }
    }
  } else {
    // Handling past dates if needed
    remainingDays = Math.abs(remainingDays);
    while (remainingDays > 0) {
      if (remainingDays >= currentDay) {
        remainingDays -= currentDay;
        currentMonth--;
        if (currentMonth < 1) {
          currentMonth = 12;
          currentYear--;
        }
        const yearDays = monthDaysLookup[currentYear] || monthDaysLookup[2081];
        currentDay = yearDays[currentMonth - 1];
      } else {
        currentDay -= remainingDays;
        remainingDays = 0;
      }
    }
  }

  const monthName = NEPALI_MONTHS[currentMonth - 1];
  const dayName = NEPALI_DAYS[now.getDay()];
  
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const ampm = hours >= 12 ? 'अपराह्न' : 'पूर्वाह्न';
  const displayHours = hours % 12 || 12;
  const timeStr = `${toNepaliNumeral(displayHours)}:${toNepaliNumeral(minutes.toString().padStart(2, '0'))} ${ampm}`;

  return {
    year: currentYear,
    month: currentMonth,
    day: currentDay,
    monthName,
    dayName,
    time: timeStr,
    formatted: `${toNepaliNumeral(currentYear)} साल ${monthName} ${toNepaliNumeral(currentDay)} गते, ${dayName}`,
    fullHeader: `आजको मिति: ${toNepaliNumeral(currentYear)} साल ${monthName} ${toNepaliNumeral(currentDay)} गते, ${dayName} | समय: ${timeStr}`
  };
}

export function getRelativeTime(isoDateString: string | null | undefined): string {
  if (!isoDateString) {
    return 'मिति उपलब्ध छैन';
  }

  const publishedDate = new Date(isoDateString);
  const now = new Date();

  // Reset time for day comparison to get whole day differences
  publishedDate.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  const diffTime = now.getTime() - publishedDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); // Use Math.floor to be consistent with "ago"

  if (diffDays === 0) {
    return 'आज';
  } else if (diffDays === 1) {
    return 'हिजो';
  } else if (diffDays > 1 && diffDays < 30) {
    return `${toNepaliNumeral(diffDays)} दिन अगाडि`;
  } else if (diffDays >= 30 && diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${toNepaliNumeral(months)} महिना अगाडि`;
  } else if (diffDays >= 365) {
    const years = Math.floor(diffDays / 365);
    return `${toNepaliNumeral(years)} वर्ष अगाडि`;
  }
  return 'भविष्यको मिति (अमान्य)'; // Should not happen for published news
}