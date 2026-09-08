import type { RecurrenceConfig } from '../types/task';

/**
 * Returns today's date formatted as YYYY-MM-DD using local time
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format a YYYY-MM-DD string into a human-friendly format
 * e.g., "Tuesday, Sep 8" or "Sep 8, 2026"
 */
export function formatDisplayDate(dateStr?: string, includeDayOfWeek: boolean = true): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  
  if (isNaN(date.getTime())) return dateStr;

  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
  };

  if (includeDayOfWeek) {
    options.weekday = 'short';
  }

  const currentYear = new Date().getFullYear();
  if (year !== currentYear) {
    options.year = 'numeric';
  }

  return date.toLocaleDateString(undefined, options);
}

/**
 * Format a full banner date e.g. "Tuesday, September 8, 2026"
 */
export function formatFullBannerDate(date: Date = new Date()): string {
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export interface WeekDayInfo {
  dateStr: string;       // YYYY-MM-DD
  dayName: string;       // "Monday", "Tuesday", etc.
  dayShort: string;      // "Mon", "Tue", etc.
  dayNumber: number;     // 1 to 31
  isToday: boolean;
  dateObj: Date;
}

/**
 * Get the 7 days of the week containing the reference date (Monday - Sunday)
 */
export function getWeekDates(referenceDate: Date = new Date()): WeekDayInfo[] {
  const todayStr = getTodayDateString();
  const current = new Date(referenceDate);
  
  // In JS getDay(): 0 is Sunday, 1 is Monday ... 6 is Saturday
  // Convert so Monday is start of week (0 to 6)
  const currentDay = current.getDay();
  const distanceToMonday = (currentDay + 6) % 7;
  
  const monday = new Date(current);
  monday.setDate(current.getDate() - distanceToMonday);
  monday.setHours(0, 0, 0, 0);

  const days: WeekDayInfo[] = [];
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayShorts = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    days.push({
      dateStr,
      dayName: dayNames[i],
      dayShort: dayShorts[i],
      dayNumber: d.getDate(),
      isToday: dateStr === todayStr,
      dateObj: d,
    });
  }

  return days;
}

/**
 * Calculate the next planned date for recurring tasks upon completion
 */
export function calculateNextRecurrenceDate(
  currentPlannedDate: string | undefined,
  recurrence: RecurrenceConfig
): string {
  const baseDateStr = currentPlannedDate || getTodayDateString();
  const [year, month, day] = baseDateStr.split('-').map(Number);
  const baseDate = new Date(year, month - 1, day);

  const nextDate = new Date(baseDate);

  switch (recurrence.pattern) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + 1);
      break;

    case 'weekdays': {
      nextDate.setDate(nextDate.getDate() + 1);
      const dayOfWeek = nextDate.getDay();
      if (dayOfWeek === 6) { // Saturday
        nextDate.setDate(nextDate.getDate() + 2);
      } else if (dayOfWeek === 0) { // Sunday
        nextDate.setDate(nextDate.getDate() + 1);
      }
      break;
    }

    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;

    case 'custom_days': {
      if (!recurrence.daysOfWeek || recurrence.daysOfWeek.length === 0) {
        nextDate.setDate(nextDate.getDate() + 1);
      } else {
        const targetDays = [...recurrence.daysOfWeek].sort((a, b) => a - b);
        let found = false;
        for (let offset = 1; offset <= 7; offset++) {
          const testDate = new Date(baseDate);
          testDate.setDate(baseDate.getDate() + offset);
          if (targetDays.includes(testDate.getDay())) {
            nextDate.setTime(testDate.getTime());
            found = true;
            break;
          }
        }
        if (!found) {
          nextDate.setDate(nextDate.getDate() + 1);
        }
      }
      break;
    }

    default:
      nextDate.setDate(nextDate.getDate() + 1);
      break;
  }

  const nextYear = nextDate.getFullYear();
  const nextMonth = String(nextDate.getMonth() + 1).padStart(2, '0');
  const nextDay = String(nextDate.getDate()).padStart(2, '0');
  return `${nextYear}-${nextMonth}-${nextDay}`;
}
