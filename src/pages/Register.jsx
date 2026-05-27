import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { categorizeAbilities, DISABILITY_TYPES, COMFORT_OPTIONS } from '../utils/abilityEngine'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    location: '',
    disabilityType: '',
    comfortableWith: [],
  })

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleCheckbox(value) {
    setForm((prev) => ({
      ...prev,
      comfortableWith: prev.comfortableWith.includes(value)
        ? prev.comfortableWith.filter((v) => v !== value)
        : [...prev.comfortableWith, value],
    }))
  }

  function validateStep1() {
    if (!form.fullName.trim()) return 'Full name is required'
    if (!form.email.trim()) return 'Email is required'
    if (form.password.length < 6) return 'Password must be at least 6 characters'
    if (form.password !== form.confirmPassword) return 'Passwords do not match'
    return null
  }

  function validateStep2() {
    if (!form.disabilityType) return 'Please select your disability type'
    return null
  }

  function nextStep() {
    const err = validateStep1()
    if (err) { setError(err); return }
    setError('')
    setStep(2)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const err = validateStep2()
    if (err) { setError(err); return }
    setLoading(true)
    setError('')
    try {
      const assignedTracks = categorizeAbilities(form.disabilityType, form.comfortableWith)
      await register(form.email, form.password, { ...form, assignedTracks })
      navigate('/dashboard')
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''))
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
          <p>Skills-to-Income Platform</p>
        </div>

        <div className="step-indicator">
          <div className={`step-dot ${step >= 1 ? 'active' : ''}`}>1</div>
          <div className="step-line" />
          <div className={`step-dot ${step >= 2 ? 'active' : ''}`}>2</div>
        </div>
        <p className="step-label">{step === 1 ? 'Account Details' : 'Ability Profile'}</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={step === 1 ? (e) => { e.preventDefault(); nextStep() } : handleSubmit}>
          {step === 1 && (
            <>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Your full name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Password *</label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Min. 6 characters"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Confirm Password *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat password"
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+250 7XX XXX XXX"
                  />
                </div>
                <div className="form-group">
                  <label>Location / City</label>
                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="e.g. Kigali, Rwanda"
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-full">
                Continue →
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="form-group">
                <label>Disability Type *</label>
                <select
                  name="disabilityType"
                  value={form.disabilityType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select your disability type</option>
                  {DISABILITY_TYPES.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>What are you comfortable doing? (select all that apply)</label>
                <div className="checkbox-grid">
                  {COMFORT_OPTIONS.map((opt) => (
                    <label key={opt.value} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={form.comfortableWith.includes(opt.value)}
                        onChange={() => handleCheckbox(opt.value)}
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={() => setStep(1)}>
                  ← Back
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            </>
          )}
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>

      </div>
    </div>
  )
}
