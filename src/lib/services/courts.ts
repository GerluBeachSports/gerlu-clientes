import { supabase } from '../supabaseClient'

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

  if (error) throw error

  // Transforma o retorno no formato que o CourtCard espera
  return (data ?? []).map((court) => ({
    id: court.id,
    name: court.name,
    image_url: court.image_url,
    price: 0, 
    sports: court.court_sports?.map((cs: any) => cs.sports?.name).filter(Boolean) ?? []
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
    .single()

  if (error) throw error

  return {
    id: data.id,
    name: data.name,
    image_url: data.image_url,
    price: 0, 
    sports: data.court_sports?.map((cs: any) => cs.sports?.name).filter(Boolean) ?? []
  }
}