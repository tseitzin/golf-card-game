import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import Home from './pages/Home.jsx'
import GolfGame from './games/golf/GolfGame.jsx'
import RaceGame from './games/race/RaceGame.tsx'
import DotsGame from './games/dots/DotsGame.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/golf" element={<GolfGame />} />
          <Route path="/race" element={<RaceGame />} />
          <Route path="/dots" element={<DotsGame />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
