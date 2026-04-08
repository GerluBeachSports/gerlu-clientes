import { Link } from 'react-router-dom';
import LogoMeta from '../assets/logo-meta.png';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';   // ← Ícones simples e leves (recomendado)

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header
      className="fixed top-0 left-0 z-50 w-full bg-maingreen text-white"
    >
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link to="/" onClick={closeMenu}>
          <img 
            src={LogoMeta} 
            alt="Logo Meta Centro Esportivo" 
            className="h-10 w-auto object-contain" 
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link to="/" className="navbar-button hover:text-white/80 transition-colors">
            Home
          </Link>
          <Link to="/agendamentos" className="navbar-button hover:text-white/80 transition-colors">
            Agendamentos
          </Link>
          <Link to="/eventos" className="navbar-button hover:text-white/80 transition-colors">
            Eventos
          </Link>
          <Link to="/perfil" className="navbar-button hover:text-white/80 transition-colors">
            Perfil
          </Link>
        </nav>

        {/* Botão Hambúrguer (Mobile) */}
        <button
          onClick={toggleMenu}
          className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Menu Mobile */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/20 bg-maingreen">
          <nav className="flex flex-col px-6 py-4 gap-2 text-base">
            <Link
              to="/"
              onClick={closeMenu}
              className="navbar-button py-3 px-4 rounded-lg hover:bg-white/10 transition-colors"
            >
              Home
            </Link>
            <Link
              to="/agendamentos"
              onClick={closeMenu}
              className="navbar-button py-3 px-4 rounded-lg hover:bg-white/10 transition-colors"
            >
              Agendamentos
            </Link>
            <Link
              to="/eventos"
              onClick={closeMenu}
              className="navbar-button py-3 px-4 rounded-lg hover:bg-white/10 transition-colors"
            >
              Eventos
            </Link>
            <Link
              to="/perfil"
              onClick={closeMenu}
              className="navbar-button py-3 px-4 rounded-lg hover:bg-white/10 transition-colors"
            >
              Perfil
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}