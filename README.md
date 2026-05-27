# AbilityBridge — Skills-to-Income Platform

A web platform that takes a person's disability profile, intelligently categorizes what they can do, matches them to income-generating skills, enrolls them in micro-training, then connects them to real gig/freelance/handcraft work opportunities.

---

## Features

| Screen | Description |
|--------|-------------|
| Registration | 2-step intake form — account details + disability profile with ability categorization |
| Dashboard | Assigned skill tracks, progress bars, earnings tracker, certificates |
| Training | Video modules + quizzes per track. Pass 70% to earn a certificate |
| Marketplace | Post/apply to gig tasks + list/browse handmade products |
| Admin Panel | NGO/coordinator view — all users, progress, gig management |

### Language Support
- English / Kinyarwanda toggle on every page
- Voice reader — reads the current page aloud for users who cannot read well

### Ability Categorization Engine
Maps disability type + comfort preferences to skill tracks:

| Disability | Assigned Tracks |
|------------|----------------|
| Lower limb paralysis | Digital, Handcraft, Voice |
| Visual impairment | Voice |
| Deaf / Hard of hearing | Digital, Handcraft, Cognitive |
| One arm | Digital, Voice |
| Autism spectrum | Cognitive, Digital |
| Speech impairment | Digital, Handcraft |
| Cognitive/learning | Cognitive |

---

## Tech Stack

- React 18 + Vite — fast frontend
- Firebase Auth — email/password login
- Firestore — user profiles, gigs, products, training progress
- Firebase Hosting — one-command deployment
- React Router v6 — client-side routing

---

## Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/Uwerajanviere/abilitybridge-.git
cd abilitybridge-
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up Firebase

1. Go to https://console.firebase.google.com
2. Create a new project
3. Enable Authentication > Sign-in methods > Email/Password
4. Create a Firestore Database (start in test mode)
5. Go to Project Settings > Your Apps > Add Web App
6. Copy your config values

### 4. Configure environment variables
```bash
cp .env.example .env
```
Edit `.env` and fill in your Firebase config values.

### 5. Run locally
```bash
npm run dev
```
Open http://localhost:5173

---

## Making Yourself an Admin

After registering, go to Firebase Console > Firestore > users collection > find your document > change `role` from `"user"` to `"admin"`. Refresh the app to see the Admin Panel link.

---

## Deploy to Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

Your app will be live at `https://YOUR_PROJECT_ID.web.app`

---

## Project Structure

```
src/
├── context/
│   ├── AuthContext.jsx       # Firebase auth + user profile state
│   └── LanguageContext.jsx   # English/Kinyarwanda translations + voice reader
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── CompleteProfile.jsx
│   ├── Dashboard.jsx
│   ├── Training.jsx
│   ├── Marketplace.jsx
│   └── AdminPanel.jsx
├── components/
│   ├── Navbar.jsx            # Responsive nav with language toggle + voice reader
│   └── VoiceReader.jsx       # Text-to-speech page reader
├── utils/
│   ├── abilityEngine.js      # Disability to skill track categorization logic
│   └── trainingData.js       # Training modules and quiz data
├── firebase.js
├── App.jsx
└── index.css
```

---

## Firestore Data Model

```
users/{uid}
  fullName, email, phone, location
  disabilityType, comfortableWith[]
  assignedTracks[]
  completedModules[]
  certificates[]  { moduleId, moduleName, score, earnedAt }
  totalEarnings
  role: "user" | "admin"

gigs/{gigId}
  title, description, category, budget, deadline
  postedBy, postedByName, applicants[], status

products/{productId}
  name, description, category, price, imageUrl
  sellerId, sellerName, status
```

---

## License

MIT — free to use, modify, and deploy.
