import React, { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useAuthStore } from './context/auth.js'

import Landing   from './pages/Landing.jsx'
import Login     from './pages/Login.jsx'
import Signup    from './pages/Signup.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Interview from './pages/Interview.jsx'
import Results   from './pages/Results.jsx'
import Resume    from './pages/Resume.jsx'
import Navbar    from './components/Navbar.jsx'

function ProtectedRoute({ children }) {
  const { token, initialized } = useAuthStore()
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-void">
        <div className="flex gap-2">
          <div className="typing-dot" />
          <div className="typing-dot" />
          <div className="typing-dot" />
        </div>
      </div>
    )
  }
  return token ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { token } = useAuthStore()
  return token ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  const location = useLocation()
  const init = useAuthStore((s) => s.init)

  const isAuthPage = ['/login', '/signup'].includes(location.pathname)
  const isLanding  = location.pathname === '/'

  useEffect(() => { init() }, [])

  return (
    <div className="min-h-screen bg-void">
      {!isAuthPage && !isLanding && <Navbar />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/"              element={<Landing />} />
          <Route path="/login"         element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup"        element={<PublicRoute><Signup /></PublicRoute>} />
          <Route path="/dashboard"     element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/resume"        element={<ProtectedRoute><Resume /></ProtectedRoute>} />
          <Route path="/interview/:id" element={<ProtectedRoute><Interview /></ProtectedRoute>} />
          <Route path="/results/:id"   element={<ProtectedRoute><Results /></ProtectedRoute>} />
          <Route path="*"              element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </div>
  )
}