# SkillSwap Project Handoff Document

## 1. Project Overview
SkillSwap is a peer-to-peer campus skill-sharing marketplace built for the GDG TechSprint Hackathon. It enables students to offer and request skills, matching them using tag overlap and Google Gemini AI, with integrated real-time chat and booking.

## 2. Tech Stack
- **Frontend:** React (Vite) + TypeScript
- **Styling:** TailwindCSS v4
- **Icons:** Lucide React
- **State Management:** Zustand
- **Backend:** Firebase (Authentication, Firestore, Hosting)
- **AI:** Google Gemini API (via `@google/generative-ai`)

## 3. Current Status
The project is "Frontend Ready" and "Feature Complete" in terms of UI/UX. All business logic for Firebase and Gemini is written but currently uses placeholder configurations.

### What is Done:
- **Project Scaffold:** Vite + TS + Tailwind v4 configured.
- **UI System:** 12+ reusable atomic components in `src/components/ui`.
- **Pages:** 10 fully implemented pages with routing (Landing, Dashboard, Explore, Create, Matches, Chats, etc.).
- **Auth Logic:** Google Sign-In with `@muj.manipal.edu` domain restriction.
- **Services:** Firestore services for Listings, Chat, Bookings, and Matching.
- **AI Integration:** Gemini service wrappers for match explanations and tag suggestions.
- **Security:** `firestore.rules` and `firestore.indexes.json` defined.

## 4. Setup Instructions (From Scratch)

### Prerequisites
- Node.js installed
- A Firebase Project (Google Console)
- A Gemini API Key (Google AI Studio)

### Step 1: Clone and Install
```bash
git clone <repo-url>
cd skillswap
npm install
```

### Step 2: Firebase Configuration
1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Enable **Authentication** and add the **Google** sign-in provider.
3. Create a **Firestore Database**.
4. Register a Web App and copy the `firebaseConfig` object.

### Step 3: Environment Variables
Create a `.env` file in the root directory:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### Step 4: Run Development Server
```bash
npm run dev
```

### Step 5: Deploy Rules
```bash
npx firebase login
npx firebase deploy --only firestore:rules,firestore:indexes
```

## 5. Architecture Details
- **Auth:** Managed via `src/stores/authStore.ts`. It prevents sign-in from non-MUJ domains.
- **Matching:** The logic in `src/services/matching.ts` calculates a score based on tag overlap.
- **Gemini:** Prompts are centralized in `src/services/gemini.ts`.
- **UI:** Conditional class merging via `cn()` utility in `src/lib/utils.ts`.

## 6. Known Items / Future Work
- **Notifications:** In-app state exists in `uiStore`, but real push notifications via FCM are not yet integrated.
- **Ratings:** Data model includes a rating field but the UI for leaving reviews is a future enhancement.
- **Cloud Functions:** Most logic is currently client-side for hackathon speed; could be moved to Cloud Functions for better security.

## 7. Contact
Created for GDG TechSprint.
Built by opencode.
