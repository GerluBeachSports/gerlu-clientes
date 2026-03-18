import { supabase } from '../supabaseClient'

export async function getProfile() {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user!.id)
    .single()

  if (error) throw error
  return data
}

export async function updateProfile(fullname: string, phone: string) {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('users')
    .update({ fullname, phone })
    .eq('id', user!.id)
    .select()
    .single()

  if (error) throw error
  return data
}
