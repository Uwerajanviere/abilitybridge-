import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { currentUser, userProfile, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { to: '/training', label: 'Training', icon: '📚' },
    { to: '/marketplace', label: 'Marketplace', icon: '🛒' },
    ...(userProfile?.role === 'admin' ? [{ to: '/admin', label: 'Admin', icon: '⚙️' }] : []),
  ]

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/dashboard" className="navbar-logo">
          <span>🌉</span>
          <span>AbilityBridge</span>
        </Link>

        {/* Desktop nav links */}
        <div className="navbar-links">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
            >
              {link.icon} {link.label}
            </Link>
          ))}
        </div>

        {/* User menu */}
        <div className="navbar-user">
          <button className="user-avatar-btn" onClick={() => setMenuOpen(!menuOpen)}>
            <div className="user-avatar">
              {userProfile?.fullName?.[0]?.toUpperCase() || '?'}
            </div>
            <span className="user-name">{userProfile?.fullName?.split(' ')[0]}</span>
            <span className="chevron">▾</span>
          </button>

          {menuOpen && (
            <div className="user-dropdown">
              <div className="dropdown-header">
                <strong>{userProfile?.fullName}</strong>
                <small>{currentUser?.email}</small>
                {userProfile?.role === 'admin' && <span className="badge badge-primary">Admin</span>}
              </div>
              <div className="dropdown-divider" />
              <button className="dropdown-item" onClick={handleLogout}>
                🚪 Sign Out
              </button>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="mobile-nav-link"
              onClick={() => setMenuOpen(false)}
            >
              {link.icon} {link.label}
            </Link>
          ))}
          <button className="mobile-nav-link" onClick={handleLogout}>
            🚪 Sign Out
          </button>
        </div>
      )}
    </nav>
  )
}
