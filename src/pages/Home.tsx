import { CourtCard } from '../features/courts/CourtCard'

const courtImage =
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80'

const courts = Array.from({ length: 4 }, (_, index) => ({
  id: `${index + 1}`,
  name: 'Quadra 01',
  image_url: courtImage,
  price: 60,
  sports: ['Beach Tennis', 'Vôlei', 'Futvôlei'],
}))

export function Home() {
  return (
    <section className="space-y-5">
      <h1 className="text-2xl font-bold font-montserrat text-[#181918]">Eai bora, marcar o play de hoje?</h1>
      <p className="text-zinc-500">Ver localização</p>

      <div className="bg-white rounded-2xl px-6">
        {courts.map((court) => (
          <CourtCard key={court.id} court={court} />
        ))}
      </div>
    </section>
  )
}
