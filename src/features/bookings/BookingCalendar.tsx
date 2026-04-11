import { X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'

type Props = {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  court: { name: string; image_url: string }
  sport: { name: string }
  date: Date
  time: string
  price: number
  slotDuration: number 
}

export function BookingModal({ isOpen, onClose, onConfirm, court, sport, date, time, price, slotDuration }: Props) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [profileLoaded, setProfileLoaded] = useState(false)
  const isDouble = slotDuration >= 120

  function getEndTime(startTime: string, durationMinutes: number) {
  const [h, m] = startTime.split(':').map(Number)
  const totalMinutes = h * 60 + m + durationMinutes
  const endH = Math.floor(totalMinutes / 60) % 24
  const endM = totalMinutes % 60
  return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`
}

  // Substitua o useEffect atual por esse
useEffect(() => {
  if (!isOpen) {
    setName('')
    setPhone('')
    setProfileLoaded(false)
    return
  }

  // Busca pelo id da sessão Auth
  supabase.auth.getUser().then(async ({ data: { user } }) => {
    if (!user) return

    const { data } = await supabase
      .from('users')
      .select('fullname, phone')
      .eq('id', user.id)
      .maybeSingle()

    if (data) {
      setName(data.fullname ?? '')
      setPhone(data.phone ?? '')
      setProfileLoaded(true)
    }
  })
}, [isOpen])

useEffect(() => {
  if (profileLoaded) return // já carregou, não precisa buscar
  
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 10) return

  const timer = setTimeout(async () => {
    const { data } = await supabase
      .from('users')
      .select('fullname, phone')
      .eq('phone', phone.trim())
      .maybeSingle()

    if (data) {
      setName(data.fullname ?? '')
      setProfileLoaded(true)
    }
  }, 500)

  return () => clearTimeout(timer)
}, [phone, profileLoaded])

if (!isOpen) return null


  const formattedDate = date.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  async function handleConfirm() {
  if (!name.trim() || !phone.trim()) return
  setLoading(true)

  try {
    // 1. Busca se já existe pelo telefone
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('phone', phone.trim())
      .maybeSingle()

    if (existingUser) {
      // Usuário já existe — só atualiza o nome se mudou e confirma
      await supabase
        .from('users')
        .update({ fullname: name.trim() })
        .eq('id', existingUser.id)

      await onConfirm()
      return
    }

    // 2. Usuário novo — cria sessão anônima
    let { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      const { data, error } = await supabase.auth.signInAnonymously()
      if (error) throw error
      user = data.user
    }

    if (!user) throw new Error('Erro ao obter sessão.')

    // 3. Verifica se esse id Auth já tem registro (evita duplicar sessão)
    const { data: existingById } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (existingById) {
      // Sessão Auth já tem usuário — atualiza dados e confirma
      await supabase
        .from('users')
        .update({ fullname: name.trim(), phone: phone.trim() })
        .eq('id', user.id)

      await onConfirm()
      return
    }

    // 4. Insere novo usuário
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        fullname: name.trim(),
        phone: phone.trim(),
      })

    if (insertError) throw insertError

    await onConfirm()

  } catch (err: any) {
    console.error('Erro ao confirmar:', err.message)
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-full max-w-sm bg-white rounded-2xl overflow-hidden shadow-xl">

        {/* Header */}
        <div className="gradient-background px-6 py-4 flex items-center justify-between">
          <h2 className="text-white font-semibold text-base">Confirmar Agendamento</h2>
          <button onClick={onClose}>
            <X size={18} className="text-white/80" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">

          {/* Data e Hora */}
          <div className="flex items-center gap-3 text-sm text-zinc-700">
            <div className="flex items-center gap-1.5">
              <span>📅</span>
              <span>{formattedDate}</span>
            </div>
            <span className="text-zinc-300">|</span>
            <div className="flex items-center gap-1.5">
              <span>🕐</span>
              <span className="font-semibold">{time}</span>
            </div>
          </div>

          {/* Inputs — desabilitados se perfil já carregado */}
          <input
            type="text"
            placeholder="Digite seu nome completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={profileLoaded}
            className="w-full border border-zinc-200 rounded-lg px-4 py-2.5 text-sm text-zinc-700 placeholder:text-zinc-400 outline-none focus:border-zinc-400 disabled:bg-zinc-50 disabled:text-zinc-400"
          />
          <input
            type="tel"
            placeholder="Digite seu número de telefone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={profileLoaded}
            className="w-full border border-zinc-200 rounded-lg px-4 py-2.5 text-sm text-zinc-700 placeholder:text-zinc-400 outline-none focus:border-zinc-400 disabled:bg-zinc-50 disabled:text-zinc-400"
          />
          {profileLoaded && (
            <p className="text-xs text-zinc-400">
              Usando perfil salvo.{' '}
            </p>
          )}

          {/* Quadra + Esporte */}
          <div className="flex items-center gap-3 text-sm text-zinc-700">
            <div className="flex items-center gap-2">
              <img
                src={court.image_url}
                alt={court.name}
                className="w-7 h-7 rounded-full object-cover"
              />
              <span className="font-medium">{court.name}</span>
            </div>
            <span className="text-zinc-300">|</span>
            <div className="flex items-center gap-1.5">
              <span>🏐</span>
              <span className="font-medium">{sport.name}</span>
            </div>
          </div>

          {/* Preço */}
           <div className="flex flex-col gap-1 text-sm font-semibold text-zinc-700">
    <div className="flex items-center gap-2">
      <span>💵</span>
      <span>R$ {price.toFixed(2).replace('.', ',')}</span>
    </div>
    {isDouble && (
      <div className="flex items-center gap-2 text-orange-500 text-xs font-medium">
        <span>🎉</span>
        <span>Horário 2x1 — você joga até as {getEndTime(time, slotDuration)}!</span>
      </div>
    )}
  </div>

          {/* Botões */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-red-400 text-red-500 text-sm font-semibold hover:bg-red-50 transition-colors"
            >
              Voltar
            </button>
            <button
              onClick={handleConfirm}
              disabled={!name.trim() || !phone.trim() || loading}
              className="flex-1 py-2.5 rounded-xl bg-linear-to-r from-gradientblack to-green-800 text-white text-sm font-semibold disabled:opacity-50 transition-opacity"
            >
              {loading ? 'Confirmando...' : 'Confirmar'}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}