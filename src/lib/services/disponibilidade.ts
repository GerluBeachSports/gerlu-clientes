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

type RecurringBooking = {
  start_time: string
  end_time: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0')
  const m = (minutes % 60).toString().padStart(2, '0')
  return `${h}:${m}`
}

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

function removeRecurringSlots(
  slots: TimeSlot[],
  recurring: RecurringBooking[]
): TimeSlot[] {
  return slots.filter(slot =>
    !recurring.some(
      r =>
        r.start_time.slice(0, 5) === slot.start &&
        r.end_time.slice(0, 5) === slot.end
    )
  )
}

// ─── Main Service ─────────────────────────────────────────────────────────────

export async function getAvailableSlots(
  courtId: string,
  courtSportIds: string[], // ← adicionado
  date: string,
  slotDurationMinutes = 60,
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
    if (!exception.open_time && !exception.close_time) return []
    return slotsFromWindows(exception, slotDurationMinutes)
  }

  
  // ── Step 2: No exception — use regular weekly schedule ────────────────────
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

  if (!intervalData) return []

  const interval = intervalData as OpeningInterval
  if (!interval.open_time || !interval.close_time) return []

  let slots = generateSlots(interval.open_time, interval.close_time, slotDurationMinutes)

  // ── Step 3: Remove slots bloqueados por recurring_bookings ────────────────
  const [{ data: recurringNoEnd }, { data: recurringWithEnd }] = await Promise.all([
  supabase
    .from('recurring_bookings')
    .select('start_time, end_time')
    .filter('court_sport_id', 'in', `(${courtSportIds.join(',')})`)
    .eq('day_of_week', dayOfWeek)
    .lte('valid_from', date)
    .is('valid_until', null),

  supabase
    .from('recurring_bookings')
    .select('start_time, end_time')
    .filter('court_sport_id', 'in', `(${courtSportIds.join(',')})`)
    .eq('day_of_week', dayOfWeek)
    .lte('valid_from', date)
    .gte('valid_until', date),
])

const recurringData = [...(recurringNoEnd ?? []), ...(recurringWithEnd ?? [])]

    if (recurringData.length) {
      slots = removeRecurringSlots(slots, recurringData as RecurringBooking[])
    }

  return slots
}


// ─── Weekly Schedule ──────────────────────────────────────────────────────────

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