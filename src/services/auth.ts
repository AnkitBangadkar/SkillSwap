import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider, isFirebaseConfigured } from './firebase';
import type { User } from '../types';
import { isAllowedEmail } from '../lib/utils';
import { APP_CONFIG } from '../lib/constants';

// ============================================
// Auth Error Messages
// ============================================

export const AUTH_ERRORS = {
  INVALID_DOMAIN: `Only ${APP_CONFIG.allowedEmailDomains.join(', ')} email addresses are allowed.`,
  POPUP_CLOSED: 'Sign-in popup was closed. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  FIREBASE_NOT_CONFIGURED: 'Firebase is not configured. Please add your Firebase credentials.',
  UNKNOWN: 'An unknown error occurred. Please try again.',
};

// ============================================
// Sign In with Google
// ============================================

export async function signInWithGoogle(): Promise<User> {
  // Check if Firebase is configured
  if (!isFirebaseConfigured()) {
    throw new Error(AUTH_ERRORS.FIREBASE_NOT_CONFIGURED);
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;

    // Check if email domain is allowed
    if (!firebaseUser.email || !isAllowedEmail(firebaseUser.email)) {
      // Sign out the user immediately
      await firebaseSignOut(auth);
      throw new Error(AUTH_ERRORS.INVALID_DOMAIN);
    }

    // Create or update user document in Firestore
    const user = await createOrUpdateUser(firebaseUser);
    return user;
  } catch (error: unknown) {
    // Handle specific Firebase auth errors
    if (error instanceof Error) {
      if (error.message === AUTH_ERRORS.INVALID_DOMAIN) {
        throw error;
      }
      if (error.message.includes('popup-closed-by-user')) {
        throw new Error(AUTH_ERRORS.POPUP_CLOSED);
      }
      if (error.message.includes('network')) {
        throw new Error(AUTH_ERRORS.NETWORK_ERROR);
      }
      throw error;
    }
    throw new Error(AUTH_ERRORS.UNKNOWN);
  }
}

// ============================================
// Create or Update User in Firestore
// ============================================

async function createOrUpdateUser(firebaseUser: FirebaseUser): Promise<User> {
  const userRef = doc(db, 'users', firebaseUser.uid);
  const userSnap = await getDoc(userRef);

  const userData: Omit<User, 'id'> & { id?: string } = {
    name: firebaseUser.displayName || 'Anonymous',
    email: firebaseUser.email || '',
    photoURL: firebaseUser.photoURL || '',
    createdAt: serverTimestamp() as User['createdAt'],
  };

  if (!userSnap.exists()) {
    // Create new user
    await setDoc(userRef, userData);
  } else {
    // Update last login (optional: update name/photo if changed)
    await setDoc(userRef, userData, { merge: true });
  }

  return {
    id: firebaseUser.uid,
    ...userData,
    createdAt: userSnap.exists() ? userSnap.data().createdAt : userData.createdAt,
  } as User;
}

// ============================================
// Sign Out
// ============================================

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

// ============================================
// Get Current User
// ============================================

export async function getCurrentUser(): Promise<User | null> {
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) return null;

  const userRef = doc(db, 'users', firebaseUser.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return null;

  return {
    id: firebaseUser.uid,
    ...userSnap.data(),
  } as User;
}

// ============================================
// Auth State Observer
// ============================================

export function onAuthStateChange(
  callback: (user: User | null) => void
): () => void {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      // Verify email domain
      if (!firebaseUser.email || !isAllowedEmail(firebaseUser.email)) {
        await firebaseSignOut(auth);
        callback(null);
        return;
      }

      const user = await getCurrentUser();
      callback(user);
    } else {
      callback(null);
    }
  });
}
