# 🌉 AbilityBridge — Skills-to-Income Platform

A web platform that takes a person's disability profile, intelligently categorizes what they **can** do, matches them to income-generating skills, enrolls them in micro-training, then connects them to real gig/freelance/handcraft work opportunities.

---

## ✨ Features

| Screen | Description |
|--------|-------------|
| **Registration** | 2-step intake form — account details + disability profile with ability categorization |
| **Dashboard** | Assigned skill tracks, progress bars, earnings tracker, certificates |
| **Training** | Video modules + quizzes per track. Pass 70% → earn a certificate |
| **Marketplace** | Post/apply to gig tasks + list/browse handmade products |
| **Admin Panel** | NGO/coordinator view — all users, progress, gig management |

### Ability Categorization Engine
Maps disability type + comfort preferences → skill tracks:

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

## 🛠 Tech Stack

- **React 18** + **Vite** — fast frontend
- **Firebase Auth** — email/password + Google login
- **Firestore** — user profiles, gigs, products, training progress
- **Firebase Hosting** — one-command deployment
- **React Router v6** — client-side routing

---

## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/abilitybridge.git
cd abilitybridge
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (e.g. `abilitybridge`)
3. Enable **Authentication** → Sign-in methods → Email/Password + Google
4. Create a **Firestore Database** (start in test mode, then apply rules)
5. Go to **Project Settings** → Your Apps → Add Web App
6. Copy your config values

### 4. Configure environment variables
```bash
cp .env.example .env
```
Edit `.env` and fill in your Firebase config values:
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### 5. Run locally
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173)

---

## 🔐 Making Yourself an Admin

After registering your first account, go to Firebase Console → Firestore → `users` collection → find your document → change `role` from `"user"` to `"admin"`. Then refresh the app — you'll see the Admin Panel link in the navbar.

---

## 📦 Deploy to Firebase Hosting

```bash
# Install Firebase CLI (once)
npm install -g firebase-tools

# Login
firebase login

# Initialize (select Hosting, use 'dist' as public dir, SPA = yes)
firebase init

# Build the app
npm run build

# Deploy
firebase deploy
```

Your app will be live at `https://YOUR_PROJECT_ID.web.app`

---

## 📁 Project Structure

```
src/
├── context/
│   └── AuthContext.jsx      # Firebase auth + user profile state
├── pages/
│   ├── Login.jsx            # Sign in page
│   ├── Register.jsx         # 2-step registration with disability intake
│   ├── Dashboard.jsx        # User dashboard with tracks & progress
│   ├── Training.jsx         # Video modules + quiz + certificates
│   ├── Marketplace.jsx      # Gig tasks + product store
│   └── AdminPanel.jsx       # NGO coordinator view
├── components/
│   └── Navbar.jsx           # Responsive navigation
├── utils/
│   ├── abilityEngine.js     # Disability → skill track categorization logic
│   └── trainingData.js      # Training modules & quiz data
├── firebase.js              # Firebase initialization
├── App.jsx                  # Routes + auth guards
└── index.css                # All styles
```

---

## 🗺 Firestore Data Model

```
users/{uid}
  ├── fullName, email, phone, location
  ├── disabilityType, comfortableWith[]
  ├── assignedTracks[]          ← set by ability engine on registration
  ├── completedModules[]        ← updated when quiz passed
  ├── certificates[]            ← { moduleId, moduleName, score, earnedAt }
  ├── totalEarnings             ← updated manually or via payment integration
  └── role: "user" | "admin"

gigs/{gigId}
  ├── title, description, category
  ├── budget, deadline
  ├── postedBy (uid), postedByName
  ├── applicants[]              ← array of uids
  └── status: "open" | "in_progress" | "completed" | "closed"

products/{productId}
  ├── name, description, category
  ├── price, imageUrl
  ├── sellerId (uid), sellerName
  └── status: "available" | "sold"
```

---

## 🔮 Next Steps (Week 3-4)

- [ ] M-Pesa payment integration via [Daraja API](https://developer.safaricom.co.ke/)
- [ ] Stripe for international payments
- [ ] Firebase Storage for product image uploads
- [ ] Real YouTube video IDs for training modules
- [ ] Push notifications for new gig matches
- [ ] NGO partnership listings

---

## 📄 License

MIT — free to use, modify, and deploy.
