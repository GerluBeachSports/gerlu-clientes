import { supabase } from '../supabaseClient'

const COMPANY_ID = import.meta.env.VITE_COMPANY_ID

export async function getProfile() {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user!.id)
    .eq('company_id', COMPANY_ID) // 👈
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
    .eq('company_id', COMPANY_ID) // 👈
    .select()
    .single()

  if (error) throw error
  return data
}