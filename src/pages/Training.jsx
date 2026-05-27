import React, { useState, useEffect } from 'react'
import { doc, updateDoc, arrayUnion, serverTimestamp, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { TRAINING_MODULES, getModulesByTrack } from '../utils/trainingData'
import { getTrackDetails } from '../utils/abilityEngine'

export default function Training() {
  const { currentUser, userProfile } = useAuth()
  const { t } = useLanguage()
  const [profile, setProfile] = useState(userProfile)
  const [activeTrack, setActiveTrack] = useState(null)
  const [activeModule, setActiveModule] = useState(null)
  const [quizState, setQuizState] = useState({ started: false, answers: {}, submitted: false, score: 0 })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!currentUser) return
    const unsub = onSnapshot(doc(db, 'users', currentUser.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data()
        setProfile(data)
        if (!activeTrack && data.assignedTracks?.length > 0) {
          setActiveTrack(data.assignedTracks[0])
        }
      }
    })
    return unsub
  }, [currentUser])

  if (!profile) return <div className="loading-screen"><div className="spinner" /></div>

  const assignedTracks = profile.assignedTracks || []
  const completedModules = profile.completedModules || []
  const trackDetails = getTrackDetails(assignedTracks)
  const currentTrackModules = activeTrack ? getModulesByTrack(activeTrack) : []

  function openModule(mod) {
    setActiveModule(mod)
    setQuizState({ started: false, answers: {}, submitted: false, score: 0 })
  }

  function startQuiz() {
    setQuizState((q) => ({ ...q, started: true }))
  }

  function selectAnswer(qIndex, aIndex) {
    if (quizState.submitted) return
    setQuizState((q) => ({ ...q, answers: { ...q.answers, [qIndex]: aIndex } }))
  }

  async function submitQuiz() {
    const quiz = activeModule.quiz
    let correct = 0
    quiz.forEach((q, i) => { if (quizState.answers[i] === q.correct) correct++ })
    const score = Math.round((correct / quiz.length) * 100)
    const passed = score >= 70
    setQuizState((q) => ({ ...q, submitted: true, score }))
    if (passed && !completedModules.includes(activeModule.id)) {
      setSaving(true)
      try {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          completedModules: arrayUnion(activeModule.id),
          certificates: arrayUnion({
            moduleId: activeModule.id,
            moduleName: activeModule.title,
            track: activeModule.track,
            score,
            earnedAt: serverTimestamp(),
          }),
        })
      } catch (err) {
        console.error('Error saving progress:', err)
      } finally {
        setSaving(false)
      }
    }
  }

  const isCompleted = (modId) => completedModules.includes(modId)

  return (
    <div className="page">
      <h2>{t('train_title')}</h2>
      <p className="text-muted">{t('train_subtitle')}</p>

      <div className="track-tabs">
        {trackDetails.map((track) => (
          <button
            key={track.id}
            className={`track-tab ${activeTrack === track.id ? 'active' : ''}`}
            style={activeTrack === track.id ? { borderColor: track.color, color: track.color } : {}}
            onClick={() => { setActiveTrack(track.id); setActiveModule(null) }}
          >
            {track.label}
          </button>
        ))}
      </div>

      <div className="training-layout">
        <div className="module-list">
          {currentTrackModules.length === 0 && (
            <p className="text-muted">{t('train_no_modules')}</p>
          )}
          {currentTrackModules.map((mod) => {
            const done = isCompleted(mod.id)
            const active = activeModule?.id === mod.id
            return (
              <div
                key={mod.id}
                className={`module-item ${active ? 'active' : ''} ${done ? 'completed' : ''}`}
                onClick={() => openModule(mod)}
              >
                <div className="module-item-icon">{done ? '✓' : '○'}</div>
                <div className="module-item-info">
                  <div className="module-item-title">{mod.title}</div>
                  <div className="module-item-meta">{mod.duration} · {mod.level}</div>
                </div>
                {done && <span className="badge badge-success">{t('train_completed')}</span>}
              </div>
            )
          })}
        </div>

        <div className="module-detail">
          {!activeModule ? (
            <div className="module-placeholder">
              <p>{t('train_select_module')}</p>
            </div>
          ) : (
            <>
              <div className="module-header">
                <h3>{activeModule.title}</h3>
                <div className="module-meta-row">
                  <span className="badge badge-outline">{activeModule.level}</span>
                  <span className="badge badge-outline">{t('train_duration')}: {activeModule.duration}</span>
                  {isCompleted(activeModule.id) && (
                    <span className="badge badge-success">{t('train_completed')}</span>
                  )}
                </div>
                <p>{activeModule.description}</p>
              </div>

              <div className="video-container">
                <iframe
                  src={`https://www.youtube.com/embed/${activeModule.videoId}`}
                  title={activeModule.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              <div className="quiz-section">
                {!quizState.started && !quizState.submitted && (
                  <div className="quiz-start">
                    <h4>{t('train_quiz_ready')}</h4>
                    <p>{t('train_quiz_pass_info')}</p>
                    <button className="btn btn-primary" onClick={startQuiz}>
                      {t('train_start_quiz')} ({activeModule.quiz.length} {t('train_questions')})
                    </button>
                  </div>
                )}

                {quizState.started && !quizState.submitted && (
                  <div className="quiz-questions">
                    <h4>{t('train_quiz_title')}</h4>
                    {activeModule.quiz.map((q, qi) => (
                      <div key={qi} className="quiz-question">
                        <p className="question-text">{qi + 1}. {q.question}</p>
                        <div className="quiz-options">
                          {q.options.map((opt, oi) => (
                            <label
                              key={oi}
                              className={`quiz-option ${quizState.answers[qi] === oi ? 'selected' : ''}`}
                            >
                              <input
                                type="radio"
                                name={`q${qi}`}
                                checked={quizState.answers[qi] === oi}
                                onChange={() => selectAnswer(qi, oi)}
                              />
                              {opt}
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                    <button
                      className="btn btn-primary"
                      onClick={submitQuiz}
                      disabled={Object.keys(quizState.answers).length < activeModule.quiz.length}
                    >
                      {t('train_submit_quiz')}
                    </button>
                  </div>
                )}

                {quizState.submitted && (
                  <div className={`quiz-result ${quizState.score >= 70 ? 'passed' : 'failed'}`}>
                    {quizState.score >= 70 ? (
                      <>
                        <h4>{t('train_passed')}</h4>
                        <p>{t('train_score')}: <strong>{quizState.score}%</strong></p>
                        <p>{saving ? t('train_saving_cert') : t('train_cert_saved')}</p>
                      </>
                    ) : (
                      <>
                        <h4>{t('train_failed')} {quizState.score}%</h4>
                        <p>{t('train_need_70')}</p>
                        <button className="btn btn-outline" onClick={startQuiz}>
                          {t('train_retry')}
                        </button>
                      </>
                    )}
                    <div className="answer-review">
                      <h5>{t('train_answer_review')}</h5>
                      {activeModule.quiz.map((q, qi) => {
                        const userAns = quizState.answers[qi]
                        const correct = q.correct
                        const isRight = userAns === correct
                        return (
                          <div key={qi} className={`answer-item ${isRight ? 'correct' : 'wrong'}`}>
                            <p><strong>{qi + 1}. {q.question}</strong></p>
                            <p>{t('train_your_answer')}: {q.options[userAns]} {isRight ? t('train_correct') : t('train_wrong')}</p>
                            {!isRight && <p className="correct-answer">{t('train_correct_answer')}: {q.options[correct]}</p>}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
