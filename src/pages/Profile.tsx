import { Pencil } from 'lucide-react'

export function Profile() {
  return (
    <section className="px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-montserrat text-[#181918]">Perfil</h1>
        <div className='rounded-full bg-[#204820] p-2'>
        <Pencil size={20} className="text-[#ffffff] cursor-pointer hover:text-[#204820] transition-colors" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs text-zinc-500 font-medium">Nome</label>
          <div className="w-full border border-zinc-300 rounded-xl px-4 py-3 text-[#181918] text-sm bg-zinc-50">
            John Doe
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-zinc-500 font-medium">Celular</label>
          <div className="w-full border border-zinc-300 rounded-xl px-4 py-3 text-[#181918] text-sm bg-zinc-50">
            (62) 99999-9999
          </div>
        </div>
      </div>
    </section>
  )
}