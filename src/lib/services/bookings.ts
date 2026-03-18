import { supabase } from '../supabaseClient'

// Busca quadra com seus esportes e horários de funcionamento
export async function getCourtById(courtId: string) {
  const { data, error } = await supabase
    .from('courts')
    .select(`
      id,
      name,
      image_url,
      price_per_hour,
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
export async function getBookedSlots(courtSportId: string, date: string) {
  const start = `${date}T00:00:00`
  const end   = `${date}T23:59:59`

  const { data, error } = await supabase
    .from('bookings')
    .select('booking_start, booking_end')
    .eq('court_sport_id', courtSportId)
    .gte('booking_start', start)
    .lte('booking_start', end)

  if (error) throw error
  return data ?? []
}

// Cria uma reserva de 1 hora
export async function createBooking(
  courtSportId: string,
  bookingStart: string,  // ex: "2026-08-20T10:00:00"
  price: number
) {
  const { data: { user } } = await supabase.auth.getUser()

  const bookingEnd = new Date(bookingStart)
  bookingEnd.setHours(bookingEnd.getHours() + 1)

  const { data, error } = await supabase
    .from('bookings')
    .insert({
      court_sport_id: courtSportId,
      user_id: user!.id,
      booking_start: bookingStart,
      booking_end: bookingEnd.toISOString(),
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