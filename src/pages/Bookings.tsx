import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, Info } from 'lucide-react'
import { useState, useEffect } from 'react'

type Court = {
  id: string
  name: string
  image_url: string
  sports: string[]
  times: {
    [period: string]: string[]
  }
}

// Simulando busca por ID
function getCourtById(id: string): Court {
  return {
    id,
    name: 'Cartola quadras',
    image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80',
    sports: ['vôlei', 'beach tennis', 'futvôlei'],
    times: {
      Manhã: ['10:00', '11:00', '12:00', '13:00', '14:00'],
      Tarde: ['15:00', '16:00', '17:00', '18:00', '19:00'],
      Noite: ['20:00', '21:00', '22:00'],
    },
  }
}

const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
const weekDates = [7, 8, 9, 10, 11, 12, 13]

export function Bookings() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [court, setCourt] = useState<Court | null>(null)
  const [selectedDate, setSelectedDate] = useState(7)
  const [selectedSport, setSelectedSport] = useState('')
  const [selectedTime, setSelectedTime] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    const data = getCourtById(id) // troque por sua chamada de API: fetchCourt(id)
    setCourt(data)
    setSelectedSport(data.sports[0])
  }, [id])

  if (!court) return <p className="p-4 text-zinc-400">Carregando...</p>

  return (
    <div className=" py-6 space-y-6 pb-10">

      {/* Voltar + Imagem */}
      <div className="relative flex justify-end">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-0 top-2 w-10 h-10 rounded-full border border-zinc-300 flex items-center justify-center gradient-background"
        >
          <ChevronLeft size={20} className="text-[#fff]" />
        </button>
        <img
          src={court.image_url}
          alt={court.name}
          className="w-32 h-32 rounded-full object-cover"
        />
      </div>

      {/* Nome + localização */}
      <div className="text-right">
        <h1 className="text-xl font-bold font-montserrat text-[#181918]">{court.name}</h1>
        <button className="flex items-center gap-1 text-sm text-zinc-500 ml-auto">
          Ver localização <Info size={14} />
        </button>
      </div>

      {/* Calendário */}
      <div className="space-y-2">
        <div className="grid grid-cols-7 text-center text-xs font-semibold text-zinc-400">
          {weekDays.map((d, i) => (
            <span key={i} className="flex items-center justify-center">{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 text-center">
          {weekDates.map((date) => (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              className={`mx-auto w-9 h-9 rounded-full text-sm font-semibold transition-colors
                ${selectedDate === date
                  ? 'gradient-background text-white border-transparent'
                  : 'text-[#181918] border border-zinc-300 hover:bg-zinc-100'}`}
            >
              {date}
            </button>
          ))}
        </div>
        <p className="text-right text-xs text-zinc-400">20 de Agosto de 2026</p>
      </div>

      {/* Esporte */}
      <div className="space-y-3">
        <p className="text-sm text-[#181918]">
          Oque vamos <strong>jogar?</strong>{' '}
          <span className="text-zinc-400 text-xs">Selecione seu esporte</span>
        </p>
        <div className="flex gap-2 flex-wrap">
          {court.sports.map((sport) => (
            <button
              key={sport}
              onClick={() => setSelectedSport(sport)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors
                ${selectedSport === sport
                  ? 'gradient-background text-white border-transparent'
                  : 'text-[#181918] border-zinc-300 hover:bg-zinc-50'}`}
            >
              {sport}
            </button>
          ))}
        </div>
      </div>

      {/* Horários */}
      <div className="space-y-4">
        <p className="text-sm text-[#181918]">
          Que horas vamos <strong>jogar hoje ?</strong>
        </p>
        {Object.entries(court.times).map(([period, times]) => (
          <div key={period} className="space-y-2">
            <span className="inline-block gradient-background text-white text-xs px-3 py-1 rounded-full">
              {period}
            </span>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {times.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium border transition-colors
                    ${selectedTime === time
                      ? 'gradient-background text-white border-transparent'
                      : 'text-[#181918] border-zinc-300 hover:bg-zinc-50'}`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}