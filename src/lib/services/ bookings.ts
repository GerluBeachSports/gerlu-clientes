import { supabase } from '../supabaseClient'

export async function getMyBookings() {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      courts (
        name,
        image_url,
        sports
      )
    `)
    .eq('user_id', user!.id)
    .order('booking_date', { ascending: true })

  if (error) throw error
  return data
}

export async function createBooking(courtId: string, date: string, time: string) {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('bookings')
    .insert({
      court_id: courtId,
      user_id: user!.id,
      booking_date: date,
      booking_time: time,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getBookedTimes(courtId: string, date: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select('booking_time')
    .eq('court_id', courtId)
    .eq('booking_date', date)

  if (error) throw error
  return data?.map(b => b.booking_time) ?? []
}