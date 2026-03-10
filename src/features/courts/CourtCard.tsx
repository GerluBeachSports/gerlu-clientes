type Court = {
  id: string
  name: string
  image_url: string
  price: number
  sports: string[]
}

type CourtCardProps = {
  court: Court
  onPress?: (courtId: string) => void
}

export function CourtCard({ court, onPress }: CourtCardProps) {
  function handlePress() {
    onPress?.(court.id)
  }

  return (
    <article
      onClick={handlePress}
      className="flex items-center justify-between py-6 border-b border-zinc-200"
    >
      <div className="flex items-center gap-4">
        <img
          src={court.image_url}
          alt={court.name}
          className="w-24 h-24 rounded-2xl object-cover"
        />

        <div>
          <h2 className="text-3xl font-semibold font-montserrat text-[#181918]">{court.name}</h2>

          <div className="text-xl text-zinc-500 mt-2 space-y-1">
            {court.sports.map((sport) => (
              <p key={sport}>⚽ {sport}</p>
            ))}
          </div>
        </div>
      </div>

      <div className="border border-zinc-400 rounded-2xl px-5 py-3 text-3xl font-semibold text-[#181918]">
        R${court.price},00
      </div>
    </article>
  )
}
