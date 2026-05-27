/**
 * Training modules data
 * Each module has a YouTube video ID, a short quiz, and belongs to a track.
 */

export const TRAINING_MODULES = [
  // ── DIGITAL TRACK ──────────────────────────────────────────────
  {
    id: 'digital_01',
    track: 'digital',
    title: 'Introduction to Data Entry',
    description: 'Learn the basics of data entry work — tools, accuracy tips, and how to find clients.',
    videoId: 'Vj6id3GNXEM', // Data Entry for Beginners
    duration: '12 min',
    level: 'Beginner',
    quiz: [
      {
        question: 'What is the most important quality in data entry work?',
        options: ['Speed', 'Accuracy', 'Creativity', 'Strength'],
        correct: 1,
      },
      {
        question: 'Which tool is commonly used for data entry?',
        options: ['Photoshop', 'Google Sheets / Excel', 'Blender', 'Audacity'],
        correct: 1,
      },
      {
        question: 'How can you verify your data entry is correct?',
        options: ['Guess', 'Double-check against the source', 'Ask someone else to do it', 'Submit without checking'],
        correct: 1,
      },
    ],
  },
  {
    id: 'digital_02',
    track: 'digital',
    title: 'Social Media Management Basics',
    description: 'How to manage social media accounts for small businesses and earn from home.',
    videoId: 'q9HLKwgBMSA', // Social Media Management for Beginners
    duration: '15 min',
    level: 'Beginner',
    quiz: [
      {
        question: 'What does a social media manager primarily do?',
        options: ['Write code', 'Create and schedule posts', 'Design buildings', 'Drive deliveries'],
        correct: 1,
      },
      {
        question: 'Which platform is best for B2B social media marketing?',
        options: ['TikTok', 'LinkedIn', 'Snapchat', 'Pinterest'],
        correct: 1,
      },
      {
        question: 'What is a content calendar?',
        options: ['A wall calendar', 'A plan for what to post and when', 'A type of spreadsheet formula', 'A social media platform'],
        correct: 1,
      },
    ],
  },
  {
    id: 'digital_03',
    track: 'digital',
    title: 'Freelancing as a Virtual Assistant',
    description: 'Set up your freelance profile, find clients, and deliver virtual assistant services.',
    videoId: 'FQMpCgMDpwM', // How to Become a Virtual Assistant
    duration: '18 min',
    level: 'Intermediate',
    quiz: [
      {
        question: 'Which platform is popular for finding virtual assistant work?',
        options: ['Netflix', 'Upwork / Fiverr', 'YouTube', 'Spotify'],
        correct: 1,
      },
      {
        question: 'What should a good VA proposal include?',
        options: ['Your life story', 'Relevant skills and how you can help the client', 'Random facts', 'Nothing'],
        correct: 1,
      },
      {
        question: 'How do you build trust with a new client?',
        options: ['Overpromise', 'Deliver on time and communicate clearly', 'Ignore messages', 'Ask for payment upfront only'],
        correct: 1,
      },
    ],
  },

  // ── VOICE TRACK ────────────────────────────────────────────────
  {
    id: 'voice_01',
    track: 'voice',
    title: 'Customer Support Fundamentals',
    description: 'Handle customer inquiries professionally over phone and chat.',
    videoId: 'oJMnMBnNKMY', // Customer Service Training
    duration: '14 min',
    level: 'Beginner',
    quiz: [
      {
        question: 'What is the first thing you should do when a customer calls with a complaint?',
        options: ['Hang up', 'Listen actively and empathize', 'Transfer immediately', 'Put on hold'],
        correct: 1,
      },
      {
        question: 'What does "active listening" mean?',
        options: ['Talking a lot', 'Fully concentrating on what the customer says', 'Multitasking', 'Reading a script'],
        correct: 1,
      },
      {
        question: 'How should you end a customer support call?',
        options: ['Abruptly', 'Confirm the issue is resolved and thank the customer', 'Ask for a tip', 'Say nothing'],
        correct: 1,
      },
    ],
  },
  {
    id: 'voice_02',
    track: 'voice',
    title: 'Audio Narration & Voiceover Basics',
    description: 'Turn your voice into income — narrate audiobooks, ads, and e-learning content.',
    videoId: 'K0u_kAWLJOA', // Voiceover for Beginners
    duration: '16 min',
    level: 'Beginner',
    quiz: [
      {
        question: 'What equipment do you need to start voiceover work?',
        options: ['A camera', 'A decent microphone and quiet space', 'A car', 'A printer'],
        correct: 1,
      },
      {
        question: 'What is a "cold read" in voiceover?',
        options: ['Reading in a cold room', 'Reading a script for the first time without preparation', 'A type of microphone', 'A recording technique'],
        correct: 1,
      },
      {
        question: 'Where can you find voiceover jobs?',
        options: ['Hardware stores', 'Voices.com, ACX, Fiverr', 'Supermarkets', 'Hospitals'],
        correct: 1,
      },
    ],
  },

  // ── HANDCRAFT TRACK ────────────────────────────────────────────
  {
    id: 'handcraft_01',
    track: 'handcraft',
    title: 'Selling Handmade Products Online',
    description: 'List and sell your handmade crafts on online marketplaces and earn income.',
    videoId: 'ZnqdCFMqKVo', // How to Sell Handmade Products Online
    duration: '13 min',
    level: 'Beginner',
    quiz: [
      {
        question: 'Which platform is best known for handmade product sales?',
        options: ['LinkedIn', 'Etsy / Facebook Marketplace', 'GitHub', 'Zoom'],
        correct: 1,
      },
      {
        question: 'What makes a product listing attractive to buyers?',
        options: ['No photos', 'Clear photos and a detailed description', 'A very high price', 'No description'],
        correct: 1,
      },
      {
        question: 'How do you price your handmade product?',
        options: ['Randomly', 'Cost of materials + time + profit margin', 'Copy a competitor exactly', 'Price it at zero'],
        correct: 1,
      },
    ],
  },
  {
    id: 'handcraft_02',
    track: 'handcraft',
    title: 'Beadwork & Jewelry Making',
    description: 'Create beautiful beaded jewelry and accessories to sell locally and online.',
    videoId: 'Iy_oVTq12Gw', // Beadwork for Beginners
    duration: '20 min',
    level: 'Beginner',
    quiz: [
      {
        question: 'What is the most important tool for beadwork?',
        options: ['A hammer', 'Beading needle and thread', 'A saw', 'A drill'],
        correct: 1,
      },
      {
        question: 'How do you finish a beaded bracelet securely?',
        options: ['Leave it open', 'Tie a secure knot and add a clasp', 'Use tape', 'Glue the ends together loosely'],
        correct: 1,
      },
      {
        question: 'What is a good way to store beads?',
        options: ['On the floor', 'In labeled compartment boxes', 'In a bag mixed together', 'In water'],
        correct: 1,
      },
    ],
  },

  // ── COGNITIVE TRACK ────────────────────────────────────────────
  {
    id: 'cognitive_01',
    track: 'cognitive',
    title: 'Quality Assurance & Data Review',
    description: 'Learn how to review data, spot errors, and do quality checks for businesses.',
    videoId: 'oLc9gVM8FBM', // Introduction to Quality Assurance
    duration: '11 min',
    level: 'Beginner',
    quiz: [
      {
        question: 'What is the goal of quality assurance?',
        options: ['Make things faster', 'Ensure products/data meet required standards', 'Reduce staff', 'Increase prices'],
        correct: 1,
      },
      {
        question: 'What should you do when you find an error in data?',
        options: ['Ignore it', 'Document and report it', 'Delete the whole file', 'Guess the correct value'],
        correct: 1,
      },
      {
        question: 'Which skill is most important for QA work?',
        options: ['Singing', 'Attention to detail', 'Running fast', 'Cooking'],
        correct: 1,
      },
    ],
  },
  {
    id: 'cognitive_02',
    track: 'cognitive',
    title: 'Introduction to Basic Coding',
    description: 'Start your coding journey with HTML and CSS — no experience needed.',
    videoId: 'qz0aGYrrlhU', // HTML & CSS for Beginners
    duration: '22 min',
    level: 'Beginner',
    quiz: [
      {
        question: 'What does HTML stand for?',
        options: ['High Tech Machine Language', 'HyperText Markup Language', 'Home Tool Markup Language', 'Hyper Transfer Method Language'],
        correct: 1,
      },
      {
        question: 'What does CSS do?',
        options: ['Stores data', 'Styles the appearance of web pages', 'Runs server logic', 'Manages databases'],
        correct: 1,
      },
      {
        question: 'Which tag creates a heading in HTML?',
        options: ['<p>', '<h1>', '<div>', '<span>'],
        correct: 1,
      },
    ],
  },
]

export function getModulesByTrack(trackId) {
  return TRAINING_MODULES.filter((m) => m.track === trackId)
}

export function getModuleById(id) {
  return TRAINING_MODULES.find((m) => m.id === id)
}
