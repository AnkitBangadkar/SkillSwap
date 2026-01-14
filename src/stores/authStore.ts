import { create } from 'zustand';
import type { User } from '../types';
import { signInWithGoogle, signOut, onAuthStateChange, getCurrentUser, AUTH_ERRORS } from '../services/auth';
import { isFirebaseConfigured } from '../services/firebase';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  isFirebaseReady: boolean;

  // Actions
  initialize: () => () => void;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
  isFirebaseReady: isFirebaseConfigured(),

  initialize: () => {
    // Check if Firebase is configured
    if (!isFirebaseConfigured()) {
      set({
        isLoading: false,
        error: AUTH_ERRORS.FIREBASE_NOT_CONFIGURED,
        isFirebaseReady: false,
      });
      return () => { }; // Return empty unsubscribe
    }

    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChange((user) => {
      set({
        user,
        isAuthenticated: !!user,
        isLoading: false,
        error: null,
      });
    });

    return unsubscribe;
  },

  login: async () => {
    const { isFirebaseReady } = get();

    if (!isFirebaseReady) {
      set({ error: AUTH_ERRORS.FIREBASE_NOT_CONFIGURED });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const user = await signInWithGoogle();
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : AUTH_ERRORS.UNKNOWN,
      });
    }
  },

  logout: async () => {
    set({ isLoading: true });

    try {
      await signOut();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to sign out',
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  refreshUser: async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        set({ user });
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  },
}));
