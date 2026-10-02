// Sequence dates: month/day at HH:MM where month == day == hour == minute
// Valid range: month 1-12, day 1-12, hour 1-12, minute 01-12
// Example: 1/1 at 01:01, 2/2 at 02:02, ..., 12/12 at 12:12

export interface SequenceDate {
  date: Date;
  month: number;
  day: number;
  hour: number;
  minute: number;
  label: string;
}

/**
 * Generates all possible sequence moments for a given year.
 * A sequence moment is when month === day === hour === minute (1-12).
 * Both AM (hour=n) and PM (hour=n+12) variants are included.
 */
function getSequencesForYear(year: number): SequenceDate[] {
  const sequences: SequenceDate[] = [];

  for (let n = 1; n <= 12; n++) {
    // AM: hour = n
    const amDate = new Date(year, n - 1, n, n, n, 0, 0);
    sequences.push({
      date: amDate,
      month: n,
      day: n,
      hour: n,
      minute: n,
      label: formatSequenceLabel(amDate, n),
    });

    // PM: hour = n + 12 (skip n=12 since 12+12=24 is invalid)
    if (n < 12) {
      const pmDate = new Date(year, n - 1, n, n + 12, n, 0, 0);
      sequences.push({
        date: pmDate,
        month: n,
        day: n,
        hour: n + 12,
        minute: n,
        label: formatSequenceLabel(pmDate, n),
      });
    }
  }

  // Sort chronologically
  return sequences.sort((a, b) => a.date.getTime() - b.date.getTime());
}

function formatSequenceLabel(date: Date, n: number): string {
  const monthName = date.toLocaleString("en-US", { month: "long" });
  const period = date.getHours() >= 12 ? "PM" : "AM";
  const displayHour = n.toString().padStart(2, "0");
  const displayMin = n.toString().padStart(2, "0");
  return `${monthName} ${n} · ${displayHour}:${displayMin} ${period}`;
}

/**
 * Returns the next `count` upcoming sequence dates from `now`.
 */
export function getUpcomingSequences(now: Date, count = 5): SequenceDate[] {
  const results: SequenceDate[] = [];
  let year = now.getFullYear();

  while (results.length < count) {
    const sequences = getSequencesForYear(year);
    for (const seq of sequences) {
      if (seq.date > now) {
        results.push(seq);
        if (results.length === count) break;
      }
    }
    year++;
  }

  return results;
}

/**
 * Computes a countdown breakdown from now → target.
 */
export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number; // total seconds remaining
}

export function getCountdown(target: Date, now: Date): Countdown {
  const total = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return { days, hours, minutes, seconds, total };
}

export const REMINDER_OPTIONS = [
  { value: "0", label: "At time of event" },
  { value: "12", label: "12 minutes before" },
  { value: "60", label: "1 hour before" },
  { value: "1440", label: "1 day before" },
  { value: "10080", label: "1 week before" },
] as const;

export type ReminderValue = (typeof REMINDER_OPTIONS)[number]["value"];

// ─── ICS generation ────────────────────────────────────────────────────────────

/**
 * Maps a reminder offset (minutes as a string) to an ICS VALARM TRIGGER value.
 * Returns `undefined` for "At time of event" (0 min) so no VALARM block is emitted.
 *
 * ICS duration format: -PT<n>M  (minutes)  |  -PT<n>H  (hours)
 * We use minutes throughout to stay exact (1 day = PT1440M, 1 week = PT10080M).
 */
export function reminderToIcsTrigger(offsetMinutes: ReminderValue): string | undefined {
  if (offsetMinutes === "0") return undefined;
  const mins = parseInt(offsetMinutes, 10);
  return `-PT${mins}M`;
}

/**
 * Converts a JS Date to ICS date-time string in UTC: `YYYYMMDDTHHmmssZ`
 * The trailing "Z" tells calendar apps the timestamp is UTC, so they
 * automatically localise it to the user's device timezone.
 */
export function toIcsDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getUTCFullYear()}` +
    `${pad(date.getUTCMonth() + 1)}` +
    `${pad(date.getUTCDate())}` +
    `T` +
    `${pad(date.getUTCHours())}` +
    `${pad(date.getUTCMinutes())}` +
    `${pad(date.getUTCSeconds())}` +
    `Z`
  );
}

/**
 * Generates a complete .ics file string for a sequence event.
 *
 * @param sequence  - The selected SequenceDate
 * @param reminder  - The ReminderValue chosen by the user
 * @param note      - Optional personal message stored in DESCRIPTION
 */
export function generateIcs(
  sequence: SequenceDate,
  reminder: ReminderValue,
  note: string
): string {
  const dtStart = toIcsDate(sequence.date);
  const dtEnd = toIcsDate(new Date(sequence.date.getTime() + 60 * 60 * 1000)); // +1 hour
  const trigger = reminderToIcsTrigger(reminder);

  // Sanitise description: fold long lines and escape special ICS characters
  const safeDescription = (note || `Sequence moment: ${sequence.label}`)
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");

  const valarmBlock = trigger
    ? [
        "BEGIN:VALARM",
        "ACTION:DISPLAY",
        "DESCRIPTION:Reminder",
        `TRIGGER:${trigger}`,
        "END:VALARM",
      ].join("\r\n")
    : "";

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Sequence Tracker//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `SUMMARY:Sequence: ${sequence.label}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `DESCRIPTION:${safeDescription}`,
    valarmBlock,
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)          // remove empty valarm block when not needed
    .join("\r\n");             // ICS spec requires CRLF line endings

  return lines;
}

/**
 * Triggers a browser download of a .ics file.
 * Creates a temporary anchor, clicks it, then removes it — no server needed.
 */
export function downloadIcs(icsContent: string, filename = "sequence.ics"): void {
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = "none";

  document.body.appendChild(anchor);
  anchor.click();

  // Clean up after the browser has had a moment to start the download
  setTimeout(() => {
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }, 100);
}

