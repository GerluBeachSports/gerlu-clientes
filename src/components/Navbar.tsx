import { Link } from 'react-router-dom'
import LogoMeta from '../assets/logo-meta.png'

export function Navbar() {
  return (
    <header
      className="fixed top-0 left-0 z-50 w-full gradient-background text-white"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <img src={LogoMeta} alt="Logo Meta Centro Esportivo" className="h-8 w-auto object-contain" />

        <nav className="flex items-center gap-5 text-sm">
          <Link className="navbar-button whitespace-nowrap" to="/">Home</Link>
          <Link className="navbar-button whitespace-nowrap" to="/agendamentos">Agendamentos</Link>
          <Link className="navbar-button whitespace-nowrap" to="/perfil">Perfil</Link>
        </nav>
      </div>
    </header>
  )
}
