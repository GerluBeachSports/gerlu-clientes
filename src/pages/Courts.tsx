import { CourtCard } from '../features/courts/CourtCard'

const courtImage =
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80'

const courts = [
  { id: '1', name: 'Quadra A', image_url: courtImage, price: 50, sports: ['Futebol'] },
  { id: '2', name: 'Quadra B', image_url: courtImage, price: 70, sports: ['Vôlei'] },
]

export function Courts() {
  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold font-montserrat">Quadras</h1>
      <div className="bg-white rounded-2xl px-6">
        {courts.map((court) => (
          <CourtCard key={court.id} court={court} />
        ))}
      </div>
    </section>
  )
}
