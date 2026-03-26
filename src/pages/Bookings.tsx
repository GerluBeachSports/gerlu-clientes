import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, Info } from 'lucide-react'
import { useState, useEffect } from 'react'
import { getCourtById, getBookedSlots, createBooking,  getCourtPricing } from '../lib/services/bookings'
import { BookingModal } from '../features/bookings/BookingCalendar'
import { getAvailableSlots } from '../../src/lib/services/disponibilidade'


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

function formatDate(d: Date) {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
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
  const [pricingRules, setPricingRules] = useState<any[]>([])
  // Troque as linhas 42-43 por isso:
  const selectedPricing = (selectedTime && pricingRules.length > 0)
  ? getPricingForTime(selectedTime)
  : null


  // Função helper: dado um horário "HH:MM", acha a regra de pricing
function getPricingForTime(time: string) {
  const [h, m] = time.split(':').map(Number)
  const slotMinutes = h * 60 + m
  return pricingRules.find((rule) => {
    const [rh, rm] = rule.start_time.slice(0, 5).split(':').map(Number)
    const [eh, em] = rule.end_time.slice(0, 5).split(':').map(Number)
    return slotMinutes >= rh * 60 + rm && slotMinutes < eh * 60 + em
  }) ?? null
}

  
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

  const dateStr = formatDate(selectedDay)
  const dayOfWeek = selectedDay.getDay()
  const allCourtSportIds = court.court_sports?.map((cs: any) => cs.id) ?? []

  if (allCourtSportIds.length === 0) return  // ← segurança extra

  Promise.all([
    getAvailableSlots(court.id, allCourtSportIds, dateStr),
    getBookedSlots(allCourtSportIds, dateStr),
    getCourtPricing(court.id, dayOfWeek),
  ]).then(([available, booked, pricing]) => {
  const rawBookedTimes = booked.map((b: any) =>
  b.booking_start.slice(11, 16) // pega direto "HH:MM" da string sem converter timezone
  )

  // Para cada horário reservado, verifica se é slot duplo e bloqueia o próximo também
  const expandedBookedTimes = [...rawBookedTimes]

  for (const time of rawBookedTimes) {
    const rule = pricing.find((r: any) => {
      const [rh, rm] = r.start_time.slice(0, 5).split(':').map(Number)
      const [eh, em] = r.end_time.slice(0, 5).split(':').map(Number)
      const [h, m] = time.split(':').map(Number)
      const slotMin = h * 60 + m
      return slotMin >= rh * 60 + rm && slotMin < eh * 60 + em
    })

    if (rule?.slot_duration_minutes >= 120) {
      // Adiciona os horários seguintes conforme a duração
      const [h, m] = time.split(':').map(Number)
      const slots = rule!.slot_duration_minutes / 60 // ex: 2 slots de 1h
      for (let i = 1; i < slots; i++) {
        const nextH = String(h + i).padStart(2, '0')
        const nextTime = `${nextH}:${String(m).padStart(2, '0')}`
        expandedBookedTimes.push(nextTime)
      }
    }
  }

  setBookedTimes(expandedBookedTimes)
  setPricingRules(pricing)

  const times = available.map((s) => s.start)
  setAllSlots(groupByPeriod(times))
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
          <a href="https://maps.app.goo.gl/Xy3jowSaDHdPq8WT7"
        target="_blank"
        rel="noopener noreferrer"
        className="text-gradientblack text-sm w-full flex items-center gap-1"
        >
          Ver localização <Info size={14} />
          </a>
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
      {/* Banner Day Use — só aparece no sábado */}
      {selectedDay.getDay() === 6 && (
        <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-4 space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-green-600 font-montserrat">Day Use — Sábado</h3>
          </div>
          <p className="text-xs text-green-500 leading-relaxed">
            Aproveite o sábado completo com acesso a tudo que o espaço tem a oferecer!
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {[
              { label: 'Quadras', price: 'R$ 15,00' },
              { label: 'Quadra + Piscina + Sauna', price: 'R$ 20,00' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 bg-white border border-green-200 rounded-xl px-3 py-2">
                <span className="text-sm font-semibold text-[#181918]">{item.label}</span>
                <span className="text-xs font-bold text-green-500">{item.price}</span>
              </div>
            ))}
          </div>
        </div>
      )}

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

          {selectedDay.getDay() === 0 ? (
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-5 space-y-3">
              <p className="text-sm text-zinc-600 leading-relaxed">
                🗓️ <strong>Domingo</strong> os horários são diferentes, entre em contato conosco e tenha mais informações!
              </p>
              
                <a 
                href="https://wa.me/5564992014270"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 w-fit bg-green-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl"
              >
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" 
                  className="w-4 h-4" 
                />
                Falar no WhatsApp
              </a>
            </div>
          ) : Object.keys(allSlots).length === 0 ? (
            <p className="text-sm text-zinc-400">Sem horários disponíveis para este dia.</p>
          ) : (
          Object.entries(allSlots).map(([period, times]) => (
            <div key={period} className="space-y-2">
              <span className="inline-block gradient-background text-white text-xs px-3 py-1 rounded-full">
                {period}
              </span>
              <div className="flex gap-2 overflow-x-auto pb-1 pt-2 px-2">
                {times.map((time) => {
                const isBooked = bookedTimes.includes(time)
                const isSelected = selectedTime === time
                const rule = getPricingForTime(time)
                const isDouble = rule?.slot_duration_minutes >= 120
                return (
                  <button
                    key={time}
                    onClick={() => !isBooked && setSelectedTime(time)}
                    disabled={isBooked}
                    className={`relative flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium border transition-colors
                      ${isBooked
                        ? 'bg-zinc-100 text-zinc-300 border-zinc-200 cursor-not-allowed line-through'
                        : isSelected
                          ? 'gradient-background text-white border-transparent'
                          : 'text-[#181918] border-zinc-300 hover:bg-zinc-50'}`}
                    >
                    {time}
                    {isDouble && (
                      <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                        2x1
                      </span>
                    )}
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

      
      {court && selectedSport && selectedTime && (
    <BookingModal
      isOpen={showModal}
      onClose={() => setShowModal(false)}
      onConfirm={async () => {
        const dateStr = formatDate(selectedDay)
        const bookingStart = `${dateStr}T${selectedTime}:00`
        const duration = selectedPricing?.slot_duration_minutes ?? 60
        await createBooking(selectedSport.id, bookingStart, selectedPricing?.price ?? 0, duration)
        setShowModal(false)
        navigate('/Agendamentos')
      }}
      court={court}
      sport={selectedSport.sports}
      date={selectedDay}
      time={selectedTime}
      price={selectedPricing?.price ?? 0}
      slotDuration={selectedPricing?.slot_duration_minutes ?? 60}
    />
)}

    </div>
  )
}