import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import VoiceReader from './VoiceReader'

export default function Navbar() {
  const { currentUser, userProfile, logout } = useAuth()
  const { t, lang, toggleLanguage } = useLanguage()
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  const navLinks = [
    { to: '/dashboard', label: t('nav_dashboard') },
    { to: '/training',  label: t('nav_training') },
    { to: '/marketplace', label: t('nav_marketplace') },
    ...(userProfile?.role === 'admin' ? [{ to: '/admin', label: t('nav_admin') }] : []),
  ]

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/dashboard" className="navbar-logo">
          AbilityBridge
        </Link>

        {/* Desktop nav links */}
        <div className="navbar-links">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side controls */}
        <div className="navbar-controls">
          {/* Voice reader */}
          <VoiceReader />

          {/* Language toggle */}
          <button
            className="lang-toggle-btn"
            onClick={toggleLanguage}
            title={t('lang_toggle')}
            aria-label={`Switch to ${t('lang_toggle')}`}
          >
            <span className="lang-flag">{lang === 'en' ? 'RW' : 'EN'}</span>
            <span className="lang-label">{t('lang_toggle')}</span>
          </button>

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
                  {userProfile?.role === 'admin' && (
                    <span className="badge badge-primary">{t('nav_admin')}</span>
                  )}
                </div>
                <div className="dropdown-divider" />
                <button className="dropdown-item" onClick={handleLogout}>
                  {t('nav_signout')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile hamburger */}
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          {t('nav_menu')}
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
              {link.label}
            </Link>
          ))}
          {/* Mobile language toggle */}
          <button className="mobile-nav-link" onClick={toggleLanguage}>
            {t('lang_toggle')}
          </button>
          <button className="mobile-nav-link" onClick={handleLogout}>
            {t('nav_signout')}
          </button>
        </div>
      )}
    </nav>
  )
}
