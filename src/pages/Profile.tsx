import { Pencil } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
const COMPANY_ID = import.meta.env.VITE_COMPANY_ID

type Profile = {
  fullname: string
  phone: string | null
}

function AuthModal({ onSuccess }: { onSuccess: () => void }) {
  const [step, setStep] = useState<'phone' | 'register'>('phone')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const COMPANY_ID = import.meta.env.VITE_COMPANY_ID

  function getFakeEmail(rawPhone: string) {
    const digits = rawPhone.replace(/\D/g, '')
    return `${digits}@quadra.app`
  }

  // Passo 1 — verifica telefone (adiciona filtro de empresa)
async function handleCheckPhone() {
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('phone', phone)
    .eq('company_id', COMPANY_ID) // 👈 evita conflito com usuário de outra empresa
    .maybeSingle()

  if (existing) {
    const fakePassword = `quadra_${phone.replace(/\D/g, '')}`
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: getFakeEmail(phone),
      password: fakePassword,
    })
    if (signInError) throw new Error('Erro ao entrar. Tente novamente.')
    onSuccess()
  } else {
    setStep('register')
  }
}

async function handleRegister() {
  const fakeEmail = getFakeEmail(phone)      
  const fakePassword = `quadra_${phone.replace(/\D/g, '')}`

  const { data, error: signUpError } = await supabase.auth.signUp({
    email: fakeEmail,
    password: fakePassword,
  })

  if (signUpError) throw signUpError

  const { error: profileError } = await supabase
    .from('users')
    .insert({
      id: data.user!.id,
      fullname: fullName,
      phone,
      company_id: COMPANY_ID,
    })

  if (profileError) throw profileError
  onSuccess()
}

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-t-3xl px-6 py-8 space-y-6">

        <div>
          <h2 className="text-xl font-bold font-montserrat text-[#181918]">
            {step === 'phone' ? 'Identificação' : 'Qual o seu nome?'}
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            {step === 'phone'
              ? 'Digite seu telefone para entrar ou cadastrar.'
              : 'Primeira vez aqui! Só precisamos do seu nome.'}
          </p>
        </div>

        <div className="space-y-4">
          {step === 'phone' && (
            <div className="space-y-1">
              <label className="text-xs text-zinc-500 font-medium">Telefone</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="(62) 99999-9999"
                className="w-full border border-zinc-300 rounded-xl px-4 py-3 text-[#181918] text-sm bg-zinc-50 outline-none focus:border-[#204820]"
              />
            </div>
          )}

          {step === 'register' && (
            <>
              <div className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-zinc-400 text-sm bg-zinc-50">
                {phone}
              </div>
              <div className="space-y-1">
                <label className="text-xs text-zinc-500 font-medium">Nome completo</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="João da Silva"
                  autoFocus
                  className="w-full border border-zinc-300 rounded-xl px-4 py-3 text-[#181918] text-sm bg-zinc-50 outline-none focus:border-[#204820]"
                />
              </div>
            </>
          )}

          {error && <p className="text-red-500 text-xs">{error}</p>}
        </div>

        <div className="space-y-3">
          <button
            onClick={step === 'phone' ? handleCheckPhone : handleRegister}
            disabled={loading}
            className="gradient-background text-white font-semibold w-full py-3 rounded-2xl disabled:opacity-60"
          >
            {loading ? 'Aguarde...' : step === 'phone' ? 'Continuar' : 'Entrar'}
          </button>

          {step === 'register' && (
            <button
              onClick={() => { setStep('phone'); setError(null) }}
              className="w-full py-3 text-sm text-zinc-400 font-medium"
            >
              Voltar
            </button>
          )}
        </div>

      </div>
    </div>
  )
}

export function Profile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null)
  const [showModal, setShowModal] = useState(false)

  function loadProfile() {
  supabase.auth.getUser().then(async ({ data: { user } }) => {
    if (!user) { setLoggedIn(false); return }

    const { data: profileData, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .eq('company_id', COMPANY_ID) // 👈
      .single()

    if (error || !profileData) {
      await supabase.auth.signOut() // usuário não pertence a esta empresa
      setLoggedIn(false)
      return
    }

    setLoggedIn(true)
    setProfile(profileData)
  })
}

  useEffect(() => {
    loadProfile()
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    setProfile(null)
    setLoggedIn(false)
  }

  if (loggedIn === null) {
    return <p className="p-4 text-zinc-400 text-sm">Carregando...</p>
  }

  if (!loggedIn) {
    return (
      <>
        <section className="px-4 py-6 flex flex-col items-center justify-center gap-6 mt-20 text-center">
          <div className="space-y-2">
            <p className="text-2xl font-bold font-montserrat text-[#181918]">
              Vish, jogador! 👋
            </p>
            <p className="text-zinc-500 text-sm">
              Parece que você ainda não está conectado.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="gradient-background text-white font-semibold px-8 py-3 rounded-2xl w-full max-w-xs"
          >
            Entrar / Cadastrar
          </button>
        </section>

        {showModal && (
          <AuthModal onSuccess={() => {
            setShowModal(false)
            loadProfile()
          }} />
        )}
      </>
    )
  }

  return (
    <section className="px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-montserrat text-[#181918]">Perfil</h1>
        <div className="rounded-full bg-[#204820] p-2">
          <Pencil size={20} className="text-white cursor-pointer hover:opacity-80 transition-opacity" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs text-zinc-500 font-medium">Nome</label>
          <div className="w-full border border-zinc-300 rounded-xl px-4 py-3 text-[#181918] text-sm bg-zinc-50">
            {profile?.fullname ?? '—'}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-zinc-500 font-medium">Celular</label>
          <div className="w-full border border-zinc-300 rounded-xl px-4 py-3 text-[#181918] text-sm bg-zinc-50">
            {profile?.phone ?? '—'}
          </div>
        </div>
      </div>

      <button
        onClick={handleSignOut}
        className="w-full py-3 rounded-2xl border border-zinc-300 text-zinc-500 text-sm font-semibold hover:bg-zinc-50 transition-colors"
      >
        Sair
      </button>
    </section>
  )
}