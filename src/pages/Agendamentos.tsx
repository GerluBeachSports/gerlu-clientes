import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

type Agendamento = {
  id: string
  courtName: string
  sport: string
  date: string
  time: string
  image_url: string
}

export function Agendamentos() {
  const navigate = useNavigate()
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBookings() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          booking_date,
          booking_time,
          courts (
            name,
            image_url,
            sports
          )
        `)
        .eq('user_id', user.id)
        .order('booking_date', { ascending: true })

      if (error) {
        console.error(error)
        setLoading(false)
        return
      }

      const formatted: Agendamento[] = (data ?? []).map((b: any) => ({
        id: b.id,
        courtName: b.courts?.name ?? '—',
        sport: b.courts?.sports?.[0] ?? '—',
        date: new Date(b.booking_date).toLocaleDateString('pt-BR'),
        time: b.booking_time?.slice(0, 5),
        image_url: b.courts?.image_url ?? '',
      }))

      setAgendamentos(formatted)
      setLoading(false)
    }

    fetchBookings()
  }, [])

  if (loading) {
    return <p className="p-4 text-zinc-400 text-sm">Carregando...</p>
  }

  return (
    <div className="px-1 py-3 space-y-6">
      <h1 className="text-2xl font-bold font-montserrat">
        <span className="block text-[#181918]">Seus</span>
        <span className="inline-block gradient-background text-white px-2 py-1 rounded-sm">
          agendamentos
        </span>
      </h1>

      {agendamentos.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-6 mt-20 text-center">
          <div className="space-y-2">
            <p className="text-2xl font-bold font-montserrat text-[#181918]">
              Vish, jogador! 👋
            </p>
            <p className="text-zinc-500 text-sm">
              Parece que você ainda não tem agendamentos.
            </p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="gradient-background text-white font-semibold px-8 py-3 rounded-2xl w-full max-w-xs"
          >
            Agendar
          </button>
        </div>
      ) : (
        <div className="space-y-4 mt-12">
          {agendamentos.map((ag) => (
            <article
              key={ag.id}
              onClick={() => navigate(`/agendamentos/${ag.id}`)}
              className="flex items-center gap-3 cursor-pointer"
            >
              <img
                src={ag.image_url}
                alt={ag.courtName}
                className="w-24 h-32 rounded-xl object-cover flex-shrink-0"
              />
              <div className="flex-1">
                <p className="font-semibold text-[#181918] text-xl leading-tight mb-8">
                  {ag.courtName}
                </p>
                <div>
                  <p className="text-sm text-zinc-500">{ag.sport}</p>
                  <p className="text-sm text-zinc-500">{ag.date}</p>
                </div>
              </div>
              <div className="gradient-background text-white text-sm font-semibold px-4 py-2 rounded-xl flex-shrink-0 mt-20 mr-4">
                {ag.time}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}