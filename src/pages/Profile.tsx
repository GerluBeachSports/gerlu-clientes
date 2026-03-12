import { Pencil } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { getProfile } from '../lib/services/profile'

type Profile = {
  full_name: string
  phone: string | null
}

function AuthModal({ onSuccess }: { onSuccess: () => void }) {
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    if (!fullName || !phone) {
      setError('Preencha todos os campos.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // 1. Cria sessão anônima
      const { data, error: signInError } = await supabase.auth.signInAnonymously()
      if (signInError) throw signInError

      const user = data.user
      if (!user) throw new Error('Erro ao criar sessão.')

      // 2. Salva perfil na tabela profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          full_name: fullName,
          phone: phone,
        })

      if (profileError) throw profileError

      onSuccess()
    } catch (err: any) {
      setError(err.message ?? 'Erro ao entrar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-t-3xl px-6 py-8 space-y-6">

        <h2 className="text-xl font-bold font-montserrat text-[#181918]">
          Identificação
        </h2>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-zinc-500 font-medium">Nome completo</label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="João da Silva"
              className="w-full border border-zinc-300 rounded-xl px-4 py-3 text-[#181918] text-sm bg-zinc-50 outline-none focus:border-[#204820]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-zinc-500 font-medium">Telefone de contato</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="(62) 99999-9999"
              className="w-full border border-zinc-300 rounded-xl px-4 py-3 text-[#181918] text-sm bg-zinc-50 outline-none focus:border-[#204820]"
            />
          </div>

          {error && <p className="text-red-500 text-xs">{error}</p>}
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="gradient-background text-white font-semibold w-full py-3 rounded-2xl disabled:opacity-60"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </div>
    </div>
  )
}

export function Profile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null)
  const [showModal, setShowModal] = useState(false)

  function loadProfile() {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user || user.is_anonymous === false && !user.id) {
        setLoggedIn(false)
        return
      }
      setLoggedIn(true)
      getProfile().then(setProfile).catch(console.error)
    })
  }

  useEffect(() => {
    loadProfile()
  }, [])

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
            {profile?.full_name ?? '—'}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-zinc-500 font-medium">Celular</label>
          <div className="w-full border border-zinc-300 rounded-xl px-4 py-3 text-[#181918] text-sm bg-zinc-50">
            {profile?.phone ?? '—'}
          </div>
        </div>
      </div>
    </section>
  )
}