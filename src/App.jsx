import React, { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { LanguageProvider } from './context/LanguageContext'
import Navbar from './components/Navbar'

// Lazy-load pages for code splitting
const Register = lazy(() => import('./pages/Register'))
const Login = lazy(() => import('./pages/Login'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Training = lazy(() => import('./pages/Training'))
const Marketplace = lazy(() => import('./pages/Marketplace'))
const AdminPanel = lazy(() => import('./pages/AdminPanel'))
const CompleteProfile = lazy(() => import('./pages/CompleteProfile'))

function PageLoader() {
  return (
    <div className="loading-screen">
      <div className="spinner" />
      <p>Loading...</p>
    </div>
  )
}

function PrivateRoute({ children }) {
  const { currentUser, loading } = useAuth()
  if (loading) return <PageLoader />
  return currentUser ? children : <Navigate to="/login" />
}

function AdminRoute({ children }) {
  const { currentUser, userProfile, loading } = useAuth()
  if (loading) return <PageLoader />
  if (!currentUser) return <Navigate to="/login" />
  if (userProfile?.role !== 'admin') return <Navigate to="/dashboard" />
  return children
}

function AppRoutes() {
  const { currentUser, userProfile } = useAuth()

  // Redirect Google sign-in users who haven't completed their profile
  const needsProfile = currentUser && userProfile?.needsProfileCompletion

  return (
    <>
      {currentUser && !needsProfile && <Navbar />}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Navigate to={currentUser ? '/dashboard' : '/login'} />} />
          <Route path="/login" element={currentUser ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/register" element={currentUser ? <Navigate to="/dashboard" /> : <Register />} />
          <Route
            path="/complete-profile"
            element={
              <PrivateRoute>
                {needsProfile ? <CompleteProfile /> : <Navigate to="/dashboard" />}
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                {needsProfile ? <Navigate to="/complete-profile" /> : <Dashboard />}
              </PrivateRoute>
            }
          />
          <Route
            path="/training"
            element={
              <PrivateRoute>
                {needsProfile ? <Navigate to="/complete-profile" /> : <Training />}
              </PrivateRoute>
            }
          />
          <Route
            path="/marketplace"
            element={
              <PrivateRoute>
                {needsProfile ? <Navigate to="/complete-profile" /> : <Marketplace />}
              </PrivateRoute>
            }
          />
          <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
        </Routes>
      </Suspense>
    </>
  )
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </LanguageProvider>
  )
}
