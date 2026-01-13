# 🌟 SkillSwap: Project Handoff & Success Guide

Welcome to the **SkillSwap** codebase! This project was built for the GDG TechSprint Hackathon as a high-impact, AI-powered campus solution.

---

## 📖 1. What is SkillSwap? (The Big Picture)

SkillSwap is like a "Tinder for Skills" specifically for our campus. 
- **The Problem:** Students want to learn things (like React or Guitar) but don't want to pay for expensive courses, while other students have those skills but no way to share them.
- **The Solution:** A platform where you list what you **Offer** and what you **Request**. 
- **The Magic:** We use **Google Gemini AI** to look at two students and explain *why* they should meet. Then they can chat in real-time and book a session.

---

## 🛠 2. The "Under the Hood" (Technical Brief)

- **Frontend:** Built with **React** and **Vite**. It's fast, modern, and very snappy.
- **Styling:** **TailwindCSS v4**. The newest version of Tailwind, making the UI look polished and professional.
- **Backend:** **Firebase**. We use it for everything:
    - *Auth:* Logging in with Google.
    - *Firestore:* Storing listings, chats, and bookings.
    - *Hosting:* Where the website lives.
- **AI:** **Google Gemini API**. It handles the "Smart" parts of the app.

---

## 🚀 3. EXACTLY what to do next (Your Launch Checklist)

The app is built, but it's currently like a car without a battery. You need to plug in your **API Keys**.

### Step A: The Firebase Battery
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Create a project named `SkillSwap`.
3. In **Build > Authentication**, enable "Google" as a sign-in provider.
4. In **Build > Firestore Database**, click "Create Database".
5. Go to **Project Settings (the gear icon)** > **General**.
6. Scroll down to "Your apps", click the **Web icon (`</>`)**, and register the app.
7. Copy the `firebaseConfig` object values.

### Step B: The AI Battery
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Create a "New API Key".

### Step C: Plug them in
1. In the project folder, rename `.env.example` to `.env`.
2. Paste your keys into the `.env` file where it says `your_api_key`, etc.

### Step D: See it live
1. Open your terminal in the folder.
2. Run `npm install` (to get all the tools).
3. Run `npm run dev`.
4. Click the link (usually `http://localhost:5173`) to see your app!

---

## 🎯 4. Pro-Tips for your Hackathon Demo

When you show this to the judges, emphasize these **"Google Tech"** points:
1. **Security:** "We used Firebase Auth to restrict access ONLY to students with a `@muj.manipal.edu` email."
2. **AI Impact:** "We didn't just add a chatbot. We used **Gemini AI** to analyze skill profiles and generate custom compatibility explanations for every match."
3. **Real-time:** "The chat and booking system use **Firestore Snapshots**, so updates happen instantly without refreshing."

---

## 🛠 5. Roadmap: What to do after the Hackathon?
- **FCM Notifications:** Add real push notifications so students get an alert on their phone when they get a match.
- **Google Calendar Integration:** Automatically add booked sessions to the student's Google Calendar.
- **Alumni Mentors:** Allow alumni to join as "Super-Providers" to mentor juniors.

---

## ✅ 6. TODO: Your Concrete Next Steps

To make this project yours and get it demo-ready, perform these exact actions:

1.  **Environment Setup:** Rename `.env.example` to `.env` and fill in your Firebase and Gemini keys.
2.  **Domain Verification:** Open `src/lib/constants.ts` and verify the `allowedEmailDomains` array matches your exact campus email domain.
3.  **Prompt Personalization:** Open `src/services/gemini.ts`. Look at the `prompt` variables. Edit the text to make the AI sound more like a student from your campus (mention local landmarks like the "Food Court" or "Central Library").
4.  **Data Seeding (Crucial):**
    *   Once logged in, create 3 different **Offers** (e.g., "Python Basics", "Guitar Chords", "Figma Design").
    *   Create 3 different **Requests** (e.g., "Need help with Calculus", "Want to learn Spanish").
    *   This ensures that when you show the **Explore** and **Matches** pages, they are full of content.
5.  **Security Deployment:** Run `npx firebase deploy --only firestore:rules` to make sure your database is protected.

---

**Good luck with the Hackathon! You have a solid, professional-grade foundation here.**
