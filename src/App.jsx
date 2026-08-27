import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LandingPage } from './pages/LandingPage'
import { DashboardPage } from './pages/DashboardPage'
import { CreateFromScratch } from './pages/CreateFlow/CreateFromScratch'
import { CreateFromPDF } from './pages/CreateFlow/CreateFromPDF'
import { EditorPage } from './pages/EditorPage'
import { PreviewPage } from './pages/PreviewPage'
import PrintPage from './pages/PrintPage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/create/from-scratch" element={<CreateFromScratch />} />
        <Route path="/create/from-pdf" element={<CreateFromPDF />} />
        <Route path="/edit/:resumeId" element={<EditorPage />} />
        <Route path="/preview/:resumeId" element={<PreviewPage />} />
        <Route path="/print" element={<PrintPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
