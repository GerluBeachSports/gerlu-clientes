import { supabase } from '../supabaseClient'

// Busca quadra com seus esportes e horários de funcionamento
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
    .single()

  if (error) throw error
  return data
}

// Busca horários já reservados para uma court_sport em um intervalo de dia
export async function getBookedSlots(courtSportIds: string[], date: string) {
  const start = `${date}T00:00:00`
  const end   = `${date}T23:59:59`

  const { data, error } = await supabase
    .from('bookings')
    .select('booking_start, booking_end')
    .in('court_sport_id', courtSportIds)  // ← .in() em vez de .eq()
    .gte('booking_start', start)
    .lte('booking_start', end)

  if (error) throw error
  return data ?? []
}

export async function createBooking(
  courtSportId: string,
  bookingStart: string,
  price: number,
  durationMinutes: number = 60
) {
  const { data: { user } } = await supabase.auth.getUser()

  // Calcula o end direto na string, sem new Date() para evitar timezone
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

// Minhas reservas
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
        courts ( name, image_url ),
        sports ( name )
      )
    `)
    .eq('user_id', user!.id)
    .order('booking_start', { ascending: true })

  if (error) throw error
  return data
}

// Busca as regras de preço da quadra para um dia da semana
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