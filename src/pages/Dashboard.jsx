import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { getTrackDetails, getDisabilityLabel, TRACKS } from '../utils/abilityEngine'
import { TRAINING_MODULES } from '../utils/trainingData'

export default function Dashboard() {
  const { currentUser, userProfile } = useAuth()
  const [profile, setProfile] = useState(userProfile)

  // Live-sync profile from Firestore
  useEffect(() => {
    if (!currentUser) return
    const unsub = onSnapshot(doc(db, 'users', currentUser.uid), (snap) => {
      if (snap.exists()) setProfile(snap.data())
    })
    return unsub
  }, [currentUser])

  if (!profile) return <div className="loading-screen"><div className="spinner" /></div>

  const assignedTracks = profile.assignedTracks || []
  const trackDetails = getTrackDetails(assignedTracks)
  const completedModules = profile.completedModules || []
  const certificates = profile.certificates || []

  // Calculate progress per track
  const trackProgress = assignedTracks.map((trackId) => {
    const modules = TRAINING_MODULES.filter((m) => m.track === trackId)
    const done = modules.filter((m) => completedModules.includes(m.id)).length
    return { trackId, total: modules.length, done }
  })

  const totalModules = TRAINING_MODULES.filter((m) => assignedTracks.includes(m.track)).length
  const overallProgress = totalModules > 0 ? Math.round((completedModules.length / totalModules) * 100) : 0

  return (
    <div className="page">
      {/* Welcome header */}
      <div className="dashboard-header">
        <div>
          <h2>Welcome back, {profile.fullName?.split(' ')[0]} 👋</h2>
          <p className="text-muted">{getDisabilityLabel(profile.disabilityType)} · {profile.location || 'Location not set'}</p>
        </div>
        <div className="earnings-badge">
          <span className="earnings-label">Total Earned</span>
          <span className="earnings-amount">RWF {(profile.totalEarnings || 0).toLocaleString()}</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div>
            <div className="stat-value">{completedModules.length}</div>
            <div className="stat-label">Modules Completed</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div>
            <div className="stat-value">{certificates.length}</div>
            <div className="stat-label">Certificates Earned</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div>
            <div className="stat-value">{assignedTracks.length}</div>
            <div className="stat-label">Skill Tracks</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div>
            <div className="stat-value">{overallProgress}%</div>
            <div className="stat-label">Overall Progress</div>
          </div>
        </div>
      </div>

      {/* Assigned tracks */}
      <section className="section">
        <h3>Your Skill Tracks</h3>
        <p className="text-muted section-subtitle">
          Based on your profile, our engine assigned you these tracks. Each track has training modules and income opportunities.
        </p>
        <div className="tracks-grid">
          {trackDetails.map((track, i) => {
            const prog = trackProgress.find((p) => p.trackId === track.id)
            const pct = prog && prog.total > 0 ? Math.round((prog.done / prog.total) * 100) : 0
            return (
              <div key={track.id} className="track-card" style={{ '--track-color': track.color }}>
                <div className="track-header">
                  <span className="track-icon">{track.icon}</span>
                  {i === 0 && <span className="badge badge-primary">Primary</span>}
                </div>
                <h4>{track.label}</h4>
                <p>{track.description}</p>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${pct}%`, background: track.color }} />
                </div>
                <div className="progress-label">{prog?.done || 0} / {prog?.total || 0} modules · {pct}%</div>
                <Link to="/training" className="btn btn-sm" style={{ background: track.color, color: '#fff', marginTop: '0.75rem' }}>
                  Start Training →
                </Link>
              </div>
            )
          })}
        </div>
      </section>

      {/* Certificates */}
      {certificates.length > 0 && (
        <section className="section">
          <h3>Your Certificates 🏆</h3>
          <div className="certificates-grid">
            {certificates.map((cert) => (
              <div key={cert.moduleId} className="certificate-card">
                <div className="cert-icon">🎓</div>
                <div>
                  <div className="cert-title">{cert.moduleName}</div>
                  <div className="cert-date">{new Date(cert.earnedAt?.seconds * 1000).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Quick actions */}
      <section className="section">
        <h3>Quick Actions</h3>
        <div className="quick-actions">
          <Link to="/training" className="quick-action-card">
            <span>📚</span>
            <span>Continue Training</span>
          </Link>
          <Link to="/marketplace" className="quick-action-card">
            <span>🛒</span>
            <span>Browse Marketplace</span>
          </Link>
          <Link to="/marketplace?tab=sell" className="quick-action-card">
            <span>🏪</span>
            <span>List a Product</span>
          </Link>
        </div>
      </section>
    </div>
  )
}
