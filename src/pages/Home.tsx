import { Info } from 'lucide-react'
import { useEffect, useState } from 'react'
import { CourtCard } from '../features/courts/CourtCard'
import type { Court } from '../features/courts/CourtCard'
import { getCourts } from '../lib/services/courts'

export function Home() {
  const [courts, setCourts] = useState<Court[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCourts()
      .then(setCourts)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="space-y-5">
      <section className="space-y-3 w-50%">
        <h1 className="text-2xl font-bold font-montserrat">
          <span className="block text-[#181918] px-2 py-1">
            Eai bora,
          </span>
          <span className="block gradient-background text-white px-1 py-1 max-w-80">
            marcar o play de hoje?
          </span>
        </h1>
        <span className="text-[#181918] text-sm w-full flex items-center gap-1">
          ver localização <Info size={14} />
        </span>
      </section>

      <div className="bg-white rounded-2xl px-2">
        {loading ? (
          <p className="text-zinc-400 text-sm py-6 text-center">Carregando quadras...</p>
        ) : courts.length === 0 ? (
          <p className="text-zinc-400 text-sm py-6 text-center">Nenhuma quadra encontrada.</p>
        ) : (
          courts.map((court) => (
            <CourtCard key={court.id} court={court} />
          ))
        )}
      </div>
    </section>
  )
}