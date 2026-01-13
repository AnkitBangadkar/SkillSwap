# 🌟 SkillSwap

**SkillSwap** is a peer-to-peer campus skill-sharing marketplace built for the GDG TechSprint Hackathon. It connects students who want to learn new skills with those who can teach them, powered by Google Gemini AI for smart matching.

## ✨ Features

- **Google Sign-In**: Secure campus-only authentication restricted to `@muj.manipal.edu` domains.
- **Skill Marketplace**: Post "Offers" for skills you can teach and "Requests" for skills you want to learn.
- **AI Smart Matching**: Powered by **Google Gemini**, providing personalized explanations of why two students are a perfect match.
- **Real-time Chat**: Connect instantly with your matches to discuss details.
- **Session Booking**: Structured scheduling system to finalize when and where to meet.
- **Responsive UI**: A modern, snappy interface built with React and Tailwind v4.

## 🛠️ Tech Stack

- **Frontend**: React (Vite) + TypeScript
- **Styling**: TailwindCSS v4 + Lucide Icons
- **Backend**: Firebase (Authentication, Firestore, Hosting)
- **AI**: Google Gemini API
- **State Management**: Zustand

## 🚀 Quick Start

### 1. Prerequisites
- Node.js (v18+)
- Firebase Account
- Google AI Studio API Key

### 2. Installation
```bash
git clone https://github.com/AnkitBangadkar/SkillSwap.git
cd SkillSwap
npm install
```

### 3. Configuration
Rename `.env.example` to `.env` and add your credentials:
```env
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GEMINI_API_KEY=your_gemini_key
```

### 4. Development
```bash
npm run dev
```

## 🔐 Firebase Setup
1. Enable **Google Auth** in Firebase Console.
2. Create a **Firestore** database.
3. Deploy security rules:
   ```bash
   npx firebase deploy --only firestore:rules
   ```

## 📄 Documentation
For a detailed handoff and success guide, check out [HANDOFF.md](./handoff.md).

---
Built with ❤️ for GDG TechSprint.
