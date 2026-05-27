/**
 * AbilityBridge — Ability Categorization Engine
 * Maps disability types to what the person CAN do, then assigns skill tracks.
 */

export const DISABILITY_TYPES = [
  { value: 'lower_limb_paralysis', label: 'Lower Limb Paralysis / Wheelchair User' },
  { value: 'upper_limb_loss', label: 'Upper Limb Loss / Amputation (one arm)' },
  { value: 'visual_impairment', label: 'Visual Impairment / Blindness' },
  { value: 'deaf_hard_of_hearing', label: 'Deaf / Hard of Hearing' },
  { value: 'cognitive_learning', label: 'Cognitive / Learning Disability' },
  { value: 'autism_spectrum', label: 'Autism Spectrum Disorder' },
  { value: 'speech_impairment', label: 'Speech Impairment' },
  { value: 'chronic_illness', label: 'Chronic Illness / Fatigue Condition' },
  { value: 'mental_health', label: 'Mental Health Condition' },
  { value: 'multiple', label: 'Multiple Disabilities' },
  { value: 'other', label: 'Other / Prefer to Describe' },
]

export const TRACKS = {
  digital: {
    id: 'digital',
    label: 'Digital Skills',
    icon: '💻',
    color: '#4F46E5',
    description: 'Typing, data entry, design, social media management',
    skills: ['Data Entry', 'Social Media Management', 'Basic Graphic Design', 'Virtual Assistant', 'Content Writing'],
  },
  voice: {
    id: 'voice',
    label: 'Voice & Communication',
    icon: '🎙️',
    color: '#059669',
    description: 'Customer calls, audio narration, podcasting, transcription',
    skills: ['Customer Support Calls', 'Audio Narration', 'Podcast Production', 'Language Tutoring', 'Transcription'],
  },
  handcraft: {
    id: 'handcraft',
    label: 'Hands-On Crafts',
    icon: '🧵',
    color: '#D97706',
    description: 'Sewing, beadwork, candle making, handmade products',
    skills: ['Sewing & Tailoring', 'Beadwork & Jewelry', 'Candle Making', 'Basket Weaving', 'Soap Making'],
  },
  cognitive: {
    id: 'cognitive',
    label: 'Structured Cognitive Tasks',
    icon: '🧩',
    color: '#7C3AED',
    description: 'Repetitive structured tasks, data review, pattern work',
    skills: ['Data Review & QA', 'Product Packaging', 'Inventory Counting', 'Form Processing', 'Basic Coding'],
  },
}

/**
 * Core mapping: disability type → recommended tracks
 */
const DISABILITY_TRACK_MAP = {
  lower_limb_paralysis: ['digital', 'handcraft', 'voice'],
  upper_limb_loss:      ['digital', 'voice'],
  visual_impairment:    ['voice'],
  deaf_hard_of_hearing: ['digital', 'handcraft', 'cognitive'],
  cognitive_learning:   ['cognitive'],
  autism_spectrum:      ['cognitive', 'digital'],
  speech_impairment:    ['digital', 'handcraft'],
  chronic_illness:      ['digital', 'voice'],
  mental_health:        ['digital', 'cognitive'],
  multiple:             ['digital', 'voice'],
  other:                ['digital'],
}

/**
 * Comfort preferences → additional track boosts
 */
const COMFORT_TRACK_MAP = {
  typing:       ['digital', 'cognitive'],
  talking:      ['voice'],
  drawing:      ['digital', 'handcraft'],
  sewing:       ['handcraft'],
  organizing:   ['cognitive'],
  helping:      ['voice'],
  computers:    ['digital'],
  crafts:       ['handcraft'],
  repetitive:   ['cognitive'],
}

export const COMFORT_OPTIONS = [
  { value: 'typing',     label: 'Typing / Writing' },
  { value: 'talking',    label: 'Talking / Communicating' },
  { value: 'drawing',    label: 'Drawing / Designing' },
  { value: 'sewing',     label: 'Sewing / Crafting' },
  { value: 'organizing', label: 'Organizing / Sorting' },
  { value: 'helping',    label: 'Helping / Customer Service' },
  { value: 'computers',  label: 'Using Computers / Phones' },
  { value: 'crafts',     label: 'Making Things by Hand' },
  { value: 'repetitive', label: 'Repetitive / Structured Tasks' },
]

/**
 * Main categorization function
 * Returns an array of track IDs sorted by relevance score
 */
export function categorizeAbilities(disabilityType, comfortableWith = []) {
  const scores = {}

  // Base scores from disability mapping
  const baseTracks = DISABILITY_TRACK_MAP[disabilityType] || ['digital']
  baseTracks.forEach((track, index) => {
    scores[track] = (scores[track] || 0) + (3 - index) // first track gets highest score
  })

  // Boost scores from comfort preferences
  comfortableWith.forEach((comfort) => {
    const boostTracks = COMFORT_TRACK_MAP[comfort] || []
    boostTracks.forEach((track) => {
      scores[track] = (scores[track] || 0) + 1
    })
  })

  // Sort by score descending, return track IDs
  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .map(([trackId]) => trackId)
}

/**
 * Get full track objects for an array of track IDs
 */
export function getTrackDetails(trackIds) {
  return trackIds.map((id) => TRACKS[id]).filter(Boolean)
}

/**
 * Get disability label from value
 */
export function getDisabilityLabel(value) {
  return DISABILITY_TYPES.find((d) => d.value === value)?.label || value
}
