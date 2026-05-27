import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

export default function Login() {
  const { loginWithEmail } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await loginWithEmail(email, password)
      navigate('/dashboard')
    } catch (err) {
      const msg =
        err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password'
          ? 'Invalid email or password.'
          : err.code === 'auth/user-not-found'
          ? 'No account found with this email.'
          : err.code === 'auth/too-many-requests'
          ? 'Too many attempts. Please wait a moment and try again.'
          : err.message.replace('Firebase: ', '')
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="logo-icon">🌉</span>
          <h1>AbilityBridge</h1>
          <p>{t('auth_welcome')}</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('auth_email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth_email_placeholder')}
              required
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label>{t('auth_password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('auth_password_min')}
              required
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? t('auth_signing_in') : t('auth_signin')}
          </button>
        </form>

        <p className="auth-footer">
          {t('auth_no_account')} <Link to="/register">{t('auth_signup_free')}</Link>
        </p>
      </div>
    </div>
  )
}
