import { useNavigate } from 'react-router-dom'

type Agendamento = {
  id: string
  courtName: string
  sport: string
  date: string
  time: string
  image_url: string
}

const mockAgendamentos: Agendamento[] = [
  {
    id: '1',
    courtName: 'Cartola Quadras 01',
    sport: '🏃 Beach Tênis',
    date: '10/08/2026',
    time: '10:00',
    image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80',
  },
]

export function Agendamentos() {
  const navigate = useNavigate()

  return (
    <div className="px-1 py-3 space-y-6">
      {/* Título */}
      <h1 className="text-2xl font-bold font-montserrat ">
        <span className="block text-[#181918]">Seus</span>
        <span className="inline-block gradient-background text-white px-2 py-1 rounded-sm">
          agendamentos
        </span>
      </h1>

      {/* Lista */}
      <div className="space-y-4 mt-12">
        {mockAgendamentos.map((ag) => (
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

              <div className='mt-[-]'>
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
    </div>
  )
}