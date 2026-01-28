import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import Home from './pages/Home.jsx'
import GolfGame from './games/golf/GolfGame.jsx'
import RaceGame from './games/race/RaceGame.tsx'
import DotsGame from './games/dots/DotsGame.jsx'
import CheckersGame from './games/checkers/CheckersGame.jsx'
import ArcherFishGame from './games/archerfish/ArcherFishGame.tsx'
import BattlePlanesGame from './games/battleplanes/BattlePlanesGame.tsx'

createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/golf" element={<GolfGame />} />
        <Route path="/race" element={<RaceGame />} />
        <Route path="/dots" element={<DotsGame />} />
        <Route path="/checkers" element={<CheckersGame />} />
        <Route path="/archerfish" element={<ArcherFishGame />} />
        <Route path="/battleplanes" element={<BattlePlanesGame />} />
      </Routes>
    </BrowserRouter>
  </ErrorBoundary>
)
