import { supabase } from '../supabaseClient'

export async function getCourts() {
  const { data, error } = await supabase
    .from('courts')
    .select('*')

  if (error) throw error
  return data
}

export async function getCourtById(id: string) {
  const { data, error } = await supabase
    .from('courts')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}