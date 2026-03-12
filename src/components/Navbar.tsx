import { Link } from 'react-router-dom'
import LogoMeta from '../assets/logo-meta.png'

export function Navbar() {
  return (
    <>
      <div
        className="fixed top-0 left-0 w-full gradient-background z-50"
        style={{ height: "env(safe-area-inset-top)" }}
      />
      <header
        className="w-full gradient-background flex items-center justify-between px-4 pb-4 text-white sticky top-0 z-40"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.75rem)" }}
      >
        <img
          src={LogoMeta}
          alt="Logo Meta Centro Esportivo"
          className="h-8 w-auto object-contain"
        />

        <nav className="flex items-center gap-5 text-sm">
          <Link className="navbar-button whitespace-nowrap" to="/">Home</Link>
          <Link className="navbar-button whitespace-nowrap" to="/agendamentos">Agendamentos</Link>
          <Link className="navbar-button whitespace-nowrap" to="/perfil">Perfil</Link>
        </nav>
      </header>
    </>
  )
}