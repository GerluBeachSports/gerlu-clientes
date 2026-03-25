import { supabase } from '../supabaseClient'

// ─── Types ────────────────────────────────────────────────────────────────────

export type TimeSlot = {
  start: string // "HH:MM"
  end: string   // "HH:MM"
}

type OpeningInterval = {
  open_time: string | null
  close_time: string | null
}

type ScheduleException = {
  open_time: string | null
  close_time: string | null
  open_time_2: string | null
  close_time_2: string | null
  reason: string | null
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Converts "HH:MM:SS" (Postgres time) to total minutes from midnight.
 */
function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

/**
 * Converts total minutes from midnight to "HH:MM".
 */
function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0')
  const m = (minutes % 60).toString().padStart(2, '0')
  return `${h}:${m}`
}

/**
 * Generates time slots of `slotDuration` minutes within [openTime, closeTime].
 * Example: open=08:00, close=10:00, duration=60 → ["08:00–09:00", "09:00–10:00"]
 */
function generateSlots(
  openTime: string,
  closeTime: string,
  slotDurationMinutes: number
): TimeSlot[] {
  const slots: TimeSlot[] = []
  let cursor = timeToMinutes(openTime)
  const end = timeToMinutes(closeTime)

  while (cursor + slotDurationMinutes <= end) {
    slots.push({
      start: minutesToTime(cursor),
      end: minutesToTime(cursor + slotDurationMinutes),
    })
    cursor += slotDurationMinutes
  }

  return slots
}

/**
 * Builds slots from one or two time windows (exception may have two windows).
 */
function slotsFromWindows(
  exception: ScheduleException,
  slotDurationMinutes: number
): TimeSlot[] {
  const slots: TimeSlot[] = []

  if (exception.open_time && exception.close_time) {
    slots.push(...generateSlots(exception.open_time, exception.close_time, slotDurationMinutes))
  }

  if (exception.open_time_2 && exception.close_time_2) {
    slots.push(...generateSlots(exception.open_time_2, exception.close_time_2, slotDurationMinutes))
  }

  return slots
}

// ─── Main Service ─────────────────────────────────────────────────────────────

/**
 * Returns all available time slots for a given court on a given date.
 *
 * Logic:
 *  1. Check if there is a `court_schedule_exception` for this court + date.
 *     - If found and both open_time / close_time are null → court is CLOSED that day.
 *     - If found with times → use exception windows (supports 2 windows).
 *  2. If no exception → use `court_opening_interval` for the day_of_week.
 *
 * @param courtId            UUID of the court
 * @param date               Date string in "YYYY-MM-DD" format
 * @param slotDurationMinutes Duration of each slot in minutes (default: 60)
 * @returns Array of available TimeSlots, or an empty array if closed / not found
 */
export async function getAvailableSlots(
  courtId: string,
  date: string,
  slotDurationMinutes = 60
): Promise<TimeSlot[]> {
  // ── Step 1: Check for an exception on this specific date ──────────────────
  const { data: exceptionData, error: exceptionError } = await supabase
    .from('court_schedule_exception')
    .select('open_time, close_time, open_time_2, close_time_2, reason')
    .eq('court_id', courtId)
    .eq('date', date)
    .maybeSingle()

  if (exceptionError) {
    console.error('[courtAvailabilityService] Error fetching exception:', exceptionError)
    return []
  }

  if (exceptionData) {
    const exception = exceptionData as ScheduleException

    // Court is explicitly closed (e.g. holiday, maintenance)
    if (!exception.open_time && !exception.close_time) {
      return []
    }

    return slotsFromWindows(exception, slotDurationMinutes)
  }

  // ── Step 2: No exception — use regular weekly schedule ────────────────────
  // day_of_week: 0 = Sunday ... 6 = Saturday (matches JS getDay())
  const [year, month, day] = date.split('-').map(Number)
  const dayOfWeek = new Date(year, month - 1, day).getDay()

  const { data: intervalData, error: intervalError } = await supabase
    .from('court_opening_interval')
    .select('open_time, close_time')
    .eq('court_id', courtId)
    .eq('day_of_week', dayOfWeek)
    .maybeSingle()

  if (intervalError) {
    console.error('[courtAvailabilityService] Error fetching interval:', intervalError)
    return []
  }

  if (!intervalData) {
    // No schedule defined for this day → court is closed
    return []
  }

  const interval = intervalData as OpeningInterval

  if (!interval.open_time || !interval.close_time) {
    return []
  }

  return generateSlots(interval.open_time, interval.close_time, slotDurationMinutes)
}

// ─── Optional: Fetch all days schedule for a court (week view) ────────────────

/**
 * Returns the regular weekly schedule for a court.
 * Useful to render a "hours of operation" summary.
 */
export async function getWeeklySchedule(
  courtId: string
): Promise<Record<number, { open: string; close: string } | null>> {
  const { data, error } = await supabase
    .from('court_opening_interval')
    .select('day_of_week, open_time, close_time')
    .eq('court_id', courtId)

  if (error) {
    console.error('[courtAvailabilityService] Error fetching weekly schedule:', error)
    return {}
  }

  const schedule: Record<number, { open: string; close: string } | null> = {}

  for (let day = 0; day <= 6; day++) {
    const entry = (data ?? []).find((d: any) => d.day_of_week === day)
    schedule[day] = entry?.open_time && entry?.close_time
      ? { open: entry.open_time.slice(0, 5), close: entry.close_time.slice(0, 5) }
      : null
  }

  return schedule
}