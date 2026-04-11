import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { MainLayout } from '../layouts/MainLayout'
import { Home } from '../pages/Home'
import { Bookings } from '../pages/Bookings'
import { Agendamentos } from '../pages/Agendamentos'
import { Profile } from '../pages/Profile'

export function AppRoutes() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/agendamentos" element={<Agendamentos />} />
          <Route path="/perfil" element={<Profile />} />
          <Route path="/courts/:id" element={<Bookings />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  )
}