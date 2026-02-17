import React, { useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import IntakeAgent from './pages/IntakeAgent'
import VisionAgent from './pages/VisionAgent'
import ClassificationAgent from './pages/ClassificationAgent'
import IntegrationAgent from './pages/IntegrationAgent'
import CandidatesPortal from './pages/CandidatesPortal'
import './App.css'

function App() {
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const location = useLocation()

    return (
        <div className="app-layout">
            <Navbar sidebarOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
            <div className="app-body">
                <Sidebar isOpen={sidebarOpen} />
                <main className={`main-content ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
                    <AnimatePresence mode="wait">
                        <Routes location={location} key={location.pathname}>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/intake" element={<IntakeAgent />} />
                            <Route path="/vision" element={<VisionAgent />} />
                            <Route path="/classification" element={<ClassificationAgent />} />
                            <Route path="/integration" element={<IntegrationAgent />} />
                            <Route path="/candidates" element={<CandidatesPortal />} />
                        </Routes>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    )
}

export default App
