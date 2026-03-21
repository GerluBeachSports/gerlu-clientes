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
  const [cancelingId, setCancelingId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  async function fetchBookings() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

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
      .eq('user_id', user.id)
      .order('booking_start', { ascending: true })

    if (error) { console.error(error); setLoading(false); return }

    const formatted: Agendamento[] = (data ?? []).map((b: any) => ({
      id: b.id,
      courtName: b.court_sports?.courts?.name ?? '—',
      sport: b.court_sports?.sports?.name ?? '—',
      date: new Date(b.booking_start).toLocaleDateString('pt-BR'),
      time: new Date(b.booking_start).toLocaleTimeString('pt-BR', {
        hour: '2-digit', minute: '2-digit',
      }),
      image_url: b.court_sports?.courts?.image_url ?? '',
    }))

    setAgendamentos(formatted)
    setLoading(false)
  }

  useEffect(() => { fetchBookings() }, [])

  async function handleCancel(id: string) {
    setCancelingId(id)
    const { error } = await supabase.from('bookings').delete().eq('id', id)
    if (error) {
      console.error(error)
    } else {
      setAgendamentos((prev) => prev.filter((ag) => ag.id !== id))
    }
    setCancelingId(null)
    setConfirmId(null)
  }

  if (loading) return <p className="p-4 text-zinc-400 text-sm">Carregando...</p>

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
            <p className="text-2xl font-bold font-montserrat text-[#181918]">Vish, jogador! 👋</p>
            <p className="text-zinc-500 text-sm">Parece que você ainda não tem agendamentos.</p>
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
            <div key={ag.id} className="space-y-2">
              <article
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

              {/* Botão cancelar / confirmação */}
              {confirmId === ag.id ? (
                <div className="flex items-center gap-2 pl-1">
                  <p className="text-xs text-zinc-500 flex-1">Confirma o cancelamento?</p>
                  <button
                    onClick={() => handleCancel(ag.id)}
                    disabled={cancelingId === ag.id}
                    className="text-xs font-semibold text-white bg-red-500 px-3 py-1.5 rounded-lg disabled:opacity-50"
                  >
                    {cancelingId === ag.id ? 'Cancelando...' : 'Sim, cancelar'}
                  </button>
                  <button
                    onClick={() => setConfirmId(null)}
                    className="text-xs font-semibold text-zinc-500 border border-zinc-300 px-3 py-1.5 rounded-lg"
                  >
                    Voltar
                  </button>
                </div>
              ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); setConfirmId(ag.id) }}
                  className="text-xs text-red-400 underline pl-1"
                >
                  Cancelar agendamento
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}