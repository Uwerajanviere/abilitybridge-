import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, updateDoc, deleteField } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { categorizeAbilities, DISABILITY_TYPES, COMFORT_OPTIONS } from '../utils/abilityEngine'

export default function CompleteProfile() {
  const { currentUser, fetchUserProfile } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
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

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.disabilityType) {
      setError('Please select your disability type')
      return
    }
    setLoading(true)
    setError('')
    try {
      const assignedTracks = categorizeAbilities(form.disabilityType, form.comfortableWith)
      await updateDoc(doc(db, 'users', currentUser.uid), {
        phone: form.phone,
        location: form.location,
        disabilityType: form.disabilityType,
        comfortableWith: form.comfortableWith,
        assignedTracks,
        needsProfileCompletion: deleteField(),
      })
      await fetchUserProfile(currentUser.uid)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 560 }}>
        <div className="auth-logo">
          <span className="logo-icon">AB</span>
          <h1>Complete Your Profile</h1>
          <p>Tell us about yourself so we can match you to the right opportunities</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
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

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Saving...' : 'Save Profile & Continue →'}
          </button>
        </form>
      </div>
    </div>
  )
}
