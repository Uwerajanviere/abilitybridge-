import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { getTrackDetails, getDisabilityLabel } from '../utils/abilityEngine'
import { TRAINING_MODULES } from '../utils/trainingData'

export default function Dashboard() {
  const { currentUser, userProfile } = useAuth()
  const { t } = useLanguage()
  const [profile, setProfile] = useState(userProfile)

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

  const trackProgress = assignedTracks.map((trackId) => {
    const modules = TRAINING_MODULES.filter((m) => m.track === trackId)
    const done = modules.filter((m) => completedModules.includes(m.id)).length
    return { trackId, total: modules.length, done }
  })

  const totalModules = TRAINING_MODULES.filter((m) => assignedTracks.includes(m.track)).length
  const overallProgress = totalModules > 0 ? Math.round((completedModules.length / totalModules) * 100) : 0

  return (
    <div className="page">
      <div className="dashboard-header">
        <div>
          <h2>{t('dash_welcome')}, {profile.fullName?.split(' ')[0]}</h2>
          <p className="text-muted">
            {getDisabilityLabel(profile.disabilityType)} · {profile.location || t('dash_location_not_set')}
          </p>
        </div>
        <div className="earnings-badge">
          <span className="earnings-label">{t('dash_total_earned')}</span>
          <span className="earnings-amount">RWF {(profile.totalEarnings || 0).toLocaleString()}</span>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div>
            <div className="stat-value">{completedModules.length}</div>
            <div className="stat-label">{t('dash_modules_completed')}</div>
          </div>
        </div>
        <div className="stat-card">
          <div>
            <div className="stat-value">{certificates.length}</div>
            <div className="stat-label">{t('dash_certificates')}</div>
          </div>
        </div>
        <div className="stat-card">
          <div>
            <div className="stat-value">{assignedTracks.length}</div>
            <div className="stat-label">{t('dash_skill_tracks')}</div>
          </div>
        </div>
        <div className="stat-card">
          <div>
            <div className="stat-value">{overallProgress}%</div>
            <div className="stat-label">{t('dash_overall_progress')}</div>
          </div>
        </div>
      </div>

      <section className="section">
        <h3>{t('dash_your_tracks')}</h3>
        <p className="text-muted section-subtitle">{t('dash_tracks_subtitle')}</p>
        <div className="tracks-grid">
          {trackDetails.map((track, i) => {
            const prog = trackProgress.find((p) => p.trackId === track.id)
            const pct = prog && prog.total > 0 ? Math.round((prog.done / prog.total) * 100) : 0
            return (
              <div key={track.id} className="track-card" style={{ '--track-color': track.color }}>
                <div className="track-header">
                  {i === 0 && <span className="badge badge-primary">{t('dash_primary')}</span>}
                </div>
                <h4>{track.label}</h4>
                <p>{track.description}</p>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${pct}%`, background: track.color }} />
                </div>
                <div className="progress-label">
                  {prog?.done || 0} / {prog?.total || 0} {t('dash_modules_label')} · {pct}%
                </div>
                <Link to="/training" className="btn btn-sm" style={{ background: track.color, color: '#fff', marginTop: '0.75rem' }}>
                  {t('dash_start_training')}
                </Link>
              </div>
            )
          })}
        </div>
      </section>

      {certificates.length > 0 && (
        <section className="section">
          <h3>{t('dash_your_certs')}</h3>
          <div className="certificates-grid">
            {certificates.map((cert) => (
              <div key={cert.moduleId} className="certificate-card">
                <div>
                  <div className="cert-title">{cert.moduleName}</div>
                  <div className="cert-date">
                    {cert.earnedAt?.seconds
                      ? new Date(cert.earnedAt.seconds * 1000).toLocaleDateString()
                      : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="section">
        <h3>{t('dash_quick_actions')}</h3>
        <div className="quick-actions">
          <Link to="/training" className="quick-action-card">{t('dash_continue_training')}</Link>
          <Link to="/marketplace" className="quick-action-card">{t('dash_browse_market')}</Link>
          <Link to="/marketplace?tab=sell" className="quick-action-card">{t('dash_list_product')}</Link>
        </div>
      </section>
    </div>
  )
}
