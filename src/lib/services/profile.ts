import { supabase } from '../supabaseClient'

export async function getProfile() {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  if (error) throw error
  return data
}

export async function updateProfile(full_name: string, phone: string) {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('profiles')
    .update({ full_name, phone })
    .eq('id', user!.id)
    .select()
    .single()

  if (error) throw error
  return data
}
