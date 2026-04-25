import { supabase } from '../supabaseClient'

const HIDDEN_SPORT = 'Funcional na areia'
const COMPANY_ID = import.meta.env.VITE_COMPANY_ID

export async function getCourts() {
  const { data, error } = await supabase
    .from('courts')
    .select(`
      id,
      name,
      image_url,
      court_sports (
        sports (
          name
        )
      )
    `)
    .eq('company_id', COMPANY_ID)  // 👈 filtro adicionado

  if (error) throw error

  return (data ?? []).map((court) => ({
    id: court.id,
    name: court.name,
    image_url: court.image_url,
    price: 0,
    sports: court.court_sports
      ?.map((cs: any) => cs.sports?.name)
      .filter((name: any) => Boolean(name) && name !== HIDDEN_SPORT) ?? []
  }))
}

export async function getCourtById(id: string) {
  const { data, error } = await supabase
    .from('courts')
    .select(`
      id,
      name,
      image_url,
      court_sports (
        sports (
          name
        )
      )
    `)
    .eq('id', id)
    .eq('company_id', COMPANY_ID) 
    .single()

  if (error) throw error

  return {
    id: data.id,
    name: data.name,
    image_url: data.image_url,
    price: 0,
    sports: data.court_sports
      ?.map((cs: any) => cs.sports?.name)
      .filter((name: any) => Boolean(name) && name !== HIDDEN_SPORT) ?? []
  }
}