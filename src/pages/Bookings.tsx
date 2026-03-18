import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, Info } from 'lucide-react'
import { useState, useEffect } from 'react'
import { getCourtById, getBookedSlots, createBooking } from '../lib/services/bookings'
import { BookingModal } from '../features/bookings/BookingCalendar'

function generateSlots(openTime: string, closeTime: string): string[] {
  const slots: string[] = []
  const [openH] = openTime.split(':').map(Number)
  const [closeH] = closeTime.split(':').map(Number)
  for (let h = openH; h < closeH; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`)
  }
  return slots
}

function groupByPeriod(slots: string[]): { [period: string]: string[] } {
  const groups: { [period: string]: string[] } = { Manhã: [], Tarde: [], Noite: [] }
  for (const slot of slots) {
    const h = parseInt(slot)
    if (h < 12) groups['Manhã'].push(slot)
    else if (h < 18) groups['Tarde'].push(slot)
    else groups['Noite'].push(slot)
  }
  return Object.fromEntries(Object.entries(groups).filter(([, v]) => v.length > 0))
}

function getNextDays(n = 7) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return d
  })
}

const DAY_LABELS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

export function Bookings() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const days = getNextDays(7)
  const [selectedDay, setSelectedDay] = useState<Date>(days[0])
  const [court, setCourt] = useState<any>(null)
  const [selectedSport, setSelectedSport] = useState<any>(null)
  const [allSlots, setAllSlots] = useState<{ [period: string]: string[] }>({})
  const [bookedTimes, setBookedTimes] = useState<string[]>([])
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (!id) return
    getCourtById(id).then((data: Awaited<ReturnType<typeof getCourtById>>) => {
      setCourt(data)
      if (data.court_sports?.length) setSelectedSport(data.court_sports[0])
      setLoading(false)
    }).catch((err) => {
      console.error('Erro ao carregar quadra:', JSON.stringify(err))
      setLoading(false)
    })
  }, [id])

  useEffect(() => {
    if (!court || !selectedDay || !selectedSport) return

    const dow = selectedDay.getDay()
    const interval = court.court_opening_interval?.find(
      (i: any) => i.day_of_week === dow
    )

    if (!interval) {
      setAllSlots({})
      setBookedTimes([])
      return
    }

    const dateStr = selectedDay.toISOString().split('T')[0]

    getBookedSlots(selectedSport.id, dateStr).then((booked: { booking_start: string }[]) => {
      const times = booked.map((b) =>
        new Date(b.booking_start).toTimeString().slice(0, 5)
      )
      setBookedTimes(times)
      setAllSlots(groupByPeriod(generateSlots(interval.open_time, interval.close_time)))
    })
  }, [court, selectedDay, selectedSport])

  if (loading) return <p className="p-4 text-zinc-400">Carregando...</p>
  if (!court) return <p className="p-4 text-zinc-400">Quadra não encontrada.</p>

  return (
    <div className="py-6 space-y-6 pb-10">

      {/* Voltar + Imagem */}
      <div className="relative flex justify-end">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-0 top-2 w-10 h-10 rounded-full border border-zinc-300 flex items-center justify-center gradient-background"
        >
          <ChevronLeft size={20} className="text-white" />
        </button>
        <img
          src={court.image_url}
          alt={court.name}
          className="w-32 h-32 rounded-full object-cover"
        />
      </div>

      {/* Nome */}
      <div className="text-right">
        <h1 className="text-xl font-bold font-montserrat text-[#181918]">{court.name}</h1>
        <button className="flex items-center gap-1 text-sm text-zinc-500 ml-auto">
          Ver localização <Info size={14} />
        </button>
      </div>

      {/* Calendário */}
      <div className="space-y-2">
        <div className="grid grid-cols-7 text-center text-xs font-semibold text-zinc-400">
          {days.map((d) => (
            <span key={d.toISOString()} className="flex items-center justify-center">
              {DAY_LABELS[d.getDay()]}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 text-center">
          {days.map((d) => (
            <button
              key={d.toISOString()}
              onClick={() => { setSelectedDay(d); setSelectedTime(null) }}
              className={`mx-auto w-9 h-9 rounded-full text-sm font-semibold transition-colors
                ${selectedDay.toDateString() === d.toDateString()
                  ? 'gradient-background text-white border-transparent'
                  : 'text-[#181918] border border-zinc-300 hover:bg-zinc-100'}`}
            >
              {d.getDate()}
            </button>
          ))}
        </div>
        <p className="text-right text-xs text-zinc-400">
          {selectedDay.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Esporte */}
      <div className="space-y-3">
        <p className="text-sm text-[#181918]">
          O que vamos <strong>jogar?</strong>{' '}
          <span className="text-zinc-400 text-xs">Selecione seu esporte</span>
        </p>
        <div className="flex gap-2 flex-wrap">
          {court.court_sports?.map((cs: any) => (
            <button
              key={cs.id}
              onClick={() => { setSelectedSport(cs); setSelectedTime(null) }}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors
                ${selectedSport?.id === cs.id
                  ? 'gradient-background text-white border-transparent'
                  : 'text-[#181918] border-zinc-300 hover:bg-zinc-50'}`}
            >
              {cs.sports?.name}
            </button>
          ))}
        </div>
      </div>

      {/* Horários */}
      <div className="space-y-4">
        <p className="text-sm text-[#181918]">
          Que horas vamos <strong>jogar?</strong>
        </p>
        {Object.keys(allSlots).length === 0 ? (
          <p className="text-sm text-zinc-400">Sem horários disponíveis para este dia.</p>
        ) : (
          Object.entries(allSlots).map(([period, times]) => (
            <div key={period} className="space-y-2">
              <span className="inline-block gradient-background text-white text-xs px-3 py-1 rounded-full">
                {period}
              </span>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {times.map((time) => {
                  const isBooked = bookedTimes.includes(time)
                  const isSelected = selectedTime === time
                  return (
                    <button
                      key={time}
                      onClick={() => !isBooked && setSelectedTime(time)}
                      disabled={isBooked}
                      className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium border transition-colors
                        ${isBooked
                          ? 'bg-zinc-100 text-zinc-300 border-zinc-200 cursor-not-allowed line-through'
                          : isSelected
                            ? 'gradient-background text-white border-transparent'
                            : 'text-[#181918] border-zinc-300 hover:bg-zinc-50'}`}
                    >
                      {time}
                    </button>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Botão abre modal */}
      {selectedTime && (
        <button
          onClick={() => setShowModal(true)}
          className="w-full py-3 rounded-xl gradient-background text-white font-semibold text-sm"
        >
          Confirmar reserva — {selectedTime}
        </button>
      )}

      {/* Modal de confirmação */}
      {court && selectedSport && selectedTime && (
        <BookingModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onConfirm={async () => {
            const dateStr = selectedDay.toISOString().split('T')[0]
            const bookingStart = `${dateStr}T${selectedTime}:00`
            await createBooking(selectedSport.id, bookingStart, court.price_per_hour)
            setShowModal(false)
            navigate('/Agendamentos')
          }}
          court={court}
          sport={selectedSport.sports}
          date={selectedDay}
          time={selectedTime}
          price={court.price_per_hour}
        />
      )}

    </div>
  )
}