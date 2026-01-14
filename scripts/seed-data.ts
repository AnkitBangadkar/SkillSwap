// Seed script for SkillSwap - Run with: npx ts-node scripts/seed-data.ts
// Or: npx tsx scripts/seed-data.ts

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Firebase config - same as in your .env
const firebaseConfig = {
    apiKey: "AIzaSyCe0FXXyac8qxppdqUpto9jHJ91vCcCaP0",
    authDomain: "gdg-hackathon-f936d.firebaseapp.com",
    projectId: "gdg-hackathon-f936d",
    storageBucket: "gdg-hackathon-f936d.firebasestorage.app",
    messagingSenderId: "378632612746",
    appId: "1:378632612746:web:8f32719a6e07a316b7f673"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample listings from different "users"
const sampleListings = [
    {
        userId: 'demo-user-1',
        userName: 'Priya Sharma',
        userPhoto: '',
        title: 'React & TypeScript Tutoring',
        description: 'I can help you learn React with TypeScript from basics to advanced concepts. Experienced with hooks, context, and state management. 2+ years of experience building web apps.',
        type: 'offer',
        tags: ['React', 'TypeScript', 'Web Development'],
        availability: 'Weekday evenings',
        mode: 'both',
        status: 'active',
    },
    {
        userId: 'demo-user-2',
        userName: 'Vikram Singh',
        userPhoto: '',
        title: 'Need help with Machine Learning',
        description: 'Looking for someone to explain ML concepts and help with my project on neural networks. I have basic Python knowledge but struggling with TensorFlow.',
        type: 'request',
        tags: ['Machine Learning', 'Python', 'Data Science'],
        availability: 'Flexible',
        mode: 'online',
        status: 'active',
    },
    {
        userId: 'demo-user-3',
        userName: 'Meera Patel',
        userPhoto: '',
        title: 'Guitar Lessons for Beginners',
        description: "I've been playing guitar for 5 years. Can teach basics, chords, and some popular songs. Perfect for absolute beginners!",
        type: 'offer',
        tags: ['Guitar', 'Music', 'Creative Arts'],
        availability: 'Weekend afternoons',
        mode: 'offline',
        status: 'active',
    },
    {
        userId: 'demo-user-4',
        userName: 'Arjun Reddy',
        userPhoto: '',
        title: 'Spanish Language Exchange',
        description: 'Native Spanish speaker looking to practice English. Can help you with Spanish in return! Conversational practice and grammar help.',
        type: 'offer',
        tags: ['Spanish', 'English', 'Languages'],
        availability: 'Weekday mornings',
        mode: 'both',
        status: 'active',
    },
    {
        userId: 'demo-user-5',
        userName: 'Sneha Krishnan',
        userPhoto: '',
        title: 'UI/UX Design Mentorship',
        description: 'Senior design student offering mentorship in UI/UX. Experienced with Figma, user research, and prototyping. Can review portfolios too!',
        type: 'offer',
        tags: ['UI/UX Design', 'Figma', 'Graphic Design'],
        availability: 'Flexible',
        mode: 'online',
        status: 'active',
    },
    {
        userId: 'demo-user-6',
        userName: 'Karthik Nair',
        userPhoto: '',
        title: 'Need Photography Tips',
        description: 'Just got my first DSLR camera. Looking for someone to teach basics of photography - composition, lighting, editing with Lightroom.',
        type: 'request',
        tags: ['Photography', 'Creative Arts'],
        availability: 'Weekends',
        mode: 'both',
        status: 'active',
    },
    {
        userId: 'demo-user-7',
        userName: 'Ananya Gupta',
        userPhoto: '',
        title: 'Competitive Programming Coach',
        description: 'ICPC participant offering help with Data Structures, Algorithms, and competitive programming. Can help with Codeforces, LeetCode prep.',
        type: 'offer',
        tags: ['Data Structures', 'Algorithms', 'Competitive Programming'],
        availability: 'Evenings',
        mode: 'online',
        status: 'active',
    },
    {
        userId: 'demo-user-8',
        userName: 'Rahul Verma',
        userPhoto: '',
        title: 'Looking for Yoga Partner',
        description: 'Want to start practicing yoga regularly. Looking for someone experienced who can guide me through basic poses and routines.',
        type: 'request',
        tags: ['Yoga', 'Fitness', 'Wellness'],
        availability: 'Early mornings',
        mode: 'offline',
        status: 'active',
    },
];

async function seedData() {
    console.log('🌱 Seeding SkillSwap with sample listings...\n');

    const listingsCollection = collection(db, 'listings');

    for (const listing of sampleListings) {
        try {
            const docRef = await addDoc(listingsCollection, {
                ...listing,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
            console.log(`✅ Added: "${listing.title}" by ${listing.userName} (ID: ${docRef.id})`);
        } catch (error) {
            console.error(`❌ Failed to add "${listing.title}":`, error);
        }
    }

    console.log('\n🎉 Seeding complete! Refresh your app to see the listings.');
    process.exit(0);
}

seedData();
