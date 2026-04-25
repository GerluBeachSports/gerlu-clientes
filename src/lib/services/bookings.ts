import { supabase } from '../supabaseClient'

const COMPANY_ID = import.meta.env.VITE_COMPANY_ID

export async function getCourtById(courtId: string) {
  const { data, error } = await supabase
    .from('courts')
    .select(`
      id,
      name,
      image_url,
      court_sports (
        id,
        sports ( id, name )
      ),
      court_opening_interval (
        day_of_week,
        open_time,
        close_time
      )
    `)
    .eq('id', courtId)
    .eq('company_id', COMPANY_ID)
    .single()

  if (error) throw error

  const HIDDEN_SPORT_ID = '29fcc6d9-cad5-4af5-90c2-59116cad0b25'
  return {
    ...data,
    court_sports: data.court_sports.filter(
      cs => (cs.sports as unknown as { id: string; name: string } | null)?.id !== HIDDEN_SPORT_ID
    )
  }
}

export async function getBookedSlots(courtSportIds: string[], date: string) {
  const start = `${date}T00:00:00`
  const end   = `${date}T23:59:59`
  const [year, month, day] = date.split('-').map(Number)
  const dayOfWeek = new Date(year, month - 1, day).getDay()

  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('booking_start, booking_end')
    .in('court_sport_id', courtSportIds)
    .gte('booking_start', start)
    .lte('booking_start', end)

  if (bookingsError) throw bookingsError

  const { data: recurring, error: recurringError } = await supabase
    .from('recurring_bookings')
    .select('start_time, end_time')
    .in('court_sport_id', courtSportIds)
    .eq('day_of_week', dayOfWeek)
    .lte('valid_from', date)
    .or(`valid_until.is.null,valid_until.gte.${date}`)

  if (recurringError) throw recurringError

  const recurringAsBookings = (recurring ?? []).map(r => ({
    booking_start: `${date}T${r.start_time.slice(0, 5)}:00`,
    booking_end:   `${date}T${r.end_time.slice(0, 5)}:00`,
  }))

  return [...(bookings ?? []), ...recurringAsBookings]
}

export async function createBooking(
  courtSportId: string,
  bookingStart: string,
  price: number,
  durationMinutes: number = 60
) {
  const { data: { user } } = await supabase.auth.getUser()

  const [datePart, timePart] = bookingStart.split('T')
  const [h, m] = timePart.slice(0, 5).split(':').map(Number)
  const totalMinutes = h * 60 + m + durationMinutes
  const endH = String(Math.floor(totalMinutes / 60)).padStart(2, '0')
  const endM = String(totalMinutes % 60).padStart(2, '0')
  const bookingEnd = `${datePart}T${endH}:${endM}:00`

  const { data, error } = await supabase
    .from('bookings')
    .insert({
      court_sport_id: courtSportId,
      user_id: user!.id,
      booking_start: bookingStart,
      booking_end: bookingEnd,
      price,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getMyBookings() {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('bookings')
    .select(`
      id,
      booking_start,
      booking_end,
      price,
      court_sports (
        courts ( name, image_url, company_id ),
        sports ( name )
      )
    `)
    .eq('user_id', user!.id)
    .order('booking_start', { ascending: true })

  if (error) throw error

  return (data ?? []).filter(
    (b: any) => b.court_sports?.courts?.company_id === COMPANY_ID
  )
}

export async function getCourtPricing(courtId: string, dayOfWeek: number) {
  const { data, error } = await supabase
    .from('court_pricing')
    .select('start_time, end_time, price, slot_duration_minutes')
    .eq('court_id', courtId)
    .eq('day_of_week', dayOfWeek)
    .order('start_time', { ascending: true })

  if (error) throw error
  return data ?? []
}