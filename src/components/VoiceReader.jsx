import React, { useState, useEffect, useRef } from 'react'
import { useLanguage } from '../context/LanguageContext'

export default function VoiceReader() {
  const { t, lang } = useLanguage()
  const [reading, setReading] = useState(false)
  const utteranceRef = useRef(null)

  // Stop reading when language changes or component unmounts
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel()
    }
  }, [lang])

  function getPageText() {
    // Grab all visible text from the main page content, skip navbar
    const page = document.querySelector('.page') || document.querySelector('main') || document.body
    // Walk text nodes, skip script/style/button elements
    const walker = document.createTreeWalker(
      page,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          const tag = node.parentElement?.tagName?.toLowerCase()
          if (['script', 'style', 'noscript'].includes(tag)) return NodeFilter.FILTER_REJECT
          if (node.textContent.trim() === '') return NodeFilter.FILTER_REJECT
          return NodeFilter.FILTER_ACCEPT
        },
      }
    )
    const parts = []
    let node
    while ((node = walker.nextNode())) {
      parts.push(node.textContent.trim())
    }
    return parts.join('. ')
  }

  function startReading() {
    if (!window.speechSynthesis) {
      alert('Your browser does not support text-to-speech.')
      return
    }
    window.speechSynthesis.cancel()

    const text = getPageText()
    if (!text) return

    const utterance = new SpeechSynthesisUtterance(text)

    // Use Kinyarwanda-like locale if available, fallback to English
    utterance.lang = lang === 'rw' ? 'rw-RW' : 'en-US'
    utterance.rate = 0.9
    utterance.pitch = 1

    utterance.onstart = () => setReading(true)
    utterance.onend = () => setReading(false)
    utterance.onerror = () => setReading(false)

    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }

  function stopReading() {
    window.speechSynthesis?.cancel()
    setReading(false)
  }

  return (
    <button
      className={`voice-reader-btn ${reading ? 'reading' : ''}`}
      onClick={reading ? stopReading : startReading}
      title={reading ? t('voice_stop') : t('voice_read')}
      aria-label={reading ? t('voice_stop') : t('voice_read')}
    >
      {reading ? (
        <>
          <span className="voice-icon voice-pulse">&#9646;&#9646;</span>
          <span className="voice-label">{t('voice_stop')}</span>
        </>
      ) : (
        <>
          <span className="voice-icon">&#9654;</span>
          <span className="voice-label">{t('voice_read')}</span>
        </>
      )}
    </button>
  )
}
