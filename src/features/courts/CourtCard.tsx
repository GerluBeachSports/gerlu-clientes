import { useNavigate } from 'react-router-dom'

export type Court = {
  id: string
  name: string
  image_url: string
  price: number
  sports: string[]
}

type CourtCardProps = {
  court: Court
}

export function CourtCard({ court }: CourtCardProps) {
  const navigate = useNavigate()
  return (
    <article
      onClick={() => navigate(`/courts/${court.id}`)}
      className="flex items-center gap-4 py-6 border-b border-zinc-200 cursor-pointer">
      <img
        src={court.image_url}
        alt={court.name}
        className="w-24 h-32 rounded-2xl object-cover flex-shrink-0"
      />

      <div className="flex flex-col justify-between h-32 flex-1">
        <h2 className="text-lg font-semibold font-montserrat text-[#181918]">
          {court.name}
        </h2>

        <div className="text-sm text-zinc-500 space-y-0.5">
          {court.sports.map((sport) => (
            <p key={sport}>{sport}</p>
          ))}
        </div>

        <div className="flex justify-end">
          <span className="border border-zinc-400 rounded-xl px-3 py-1 text-sm font-semibold text-[#181918] mr-4">
            R$ {court.price},00
          </span>
        </div>
      </div>
    </article>
  )
}