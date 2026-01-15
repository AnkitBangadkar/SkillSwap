# SkillSwap Architecture Review & Improvement Plan

> **Review Date:** January 15, 2026  
> **Reviewed by:** Senior Software Engineer (AI)  
> **Project:** SkillSwap - P2P Campus Skill-Sharing Marketplace

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current Architecture Overview](#current-architecture-overview)
3. [Critical Issues](#critical-issues)
4. [High Priority Improvements](#high-priority-improvements)
5. [Medium Priority Improvements](#medium-priority-improvements)
6. [Low Priority Improvements](#low-priority-improvements)
7. [Implementation Roadmap](#implementation-roadmap)
8. [Appendix: File Reference](#appendix-file-reference)

---

## Executive Summary

SkillSwap is a well-structured hackathon MVP built with React 19, TypeScript, TailwindCSS v4, Firebase, Zustand, and Google Gemini AI. The codebase demonstrates good separation of concerns with clean service abstractions and proper TypeScript typing. However, several areas need attention before production deployment:

- **Security vulnerabilities** with hardcoded API keys
- **Code duplication** across components and pages
- **Missing custom hooks** for repeated patterns
- **Inconsistent dark mode** support
- **No error boundaries** or proper accessibility support
- **Manual data fetching** without caching or deduplication

**Overall Health Score: 7/10** (Solid MVP, needs production hardening)

---

## Current Architecture Overview

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript 5.9 |
| Styling | TailwindCSS v4 (with CSS variables) |
| State | Zustand (global), useState (local) |
| Backend | Firebase (Auth, Firestore) |
| AI | Google Gemini 1.5 Flash |
| Routing | React Router v7 |
| Animations | Framer Motion |
| Build | Vite 7 |

### Project Structure

```
src/
├── components/
│   ├── layout/     (6 files) - Header, MainLayout, ProtectedRoute, etc.
│   └── ui/         (17 files) - Button, Card, Modal, Input, etc.
├── pages/          (12 files) - Landing, Dashboard, Explore, etc.
├── services/       (9 files)  - Firebase, auth, listings, chat, etc.
├── stores/         (2 files)  - authStore, uiStore (Zustand)
├── lib/            (2 files)  - constants, utils
├── types/          (1 file)   - All TypeScript interfaces
└── hooks/          (empty)    - UNUSED
```

### Good Patterns Already in Place

- Barrel exports for clean imports
- Centralized route constants (`ROUTES`)
- Centralized type definitions
- Service layer abstraction (components don't import Firebase directly)
- Proper subscription cleanup in useEffect
- Deterministic chat IDs (prevents duplicates)
- Optimistic updates for notifications
- Server timestamps for all date fields

---

## Critical Issues

### 1. Hardcoded API Keys in Seed Script

**Location:** `scripts/seed-data.ts`

```typescript
// SECURITY ISSUE: API keys committed to source control
const firebaseConfig = {
    apiKey: "AIzaSyCe0FXXyac8qxppdqUpto9jHJ91vCcCaP0",
    // ... other keys
};
```

**Fix:** Remove hardcoded keys, use environment variables:

```typescript
import 'dotenv/config';

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    // ...
};
```

**Impact:** Prevents credential exposure in version control

---

## High Priority Improvements

### 2. Extract Custom React Hooks

**Problem:** Repeated patterns across 10+ components with no hooks in `src/hooks/`

**Solution:** Create the following hooks:

#### `useAsync.ts`

```typescript
// Replaces repeated loading/error/data pattern in 8+ pages
import { useState, useEffect, type DependencyList } from 'react';

interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

export function useAsync<T>(
  asyncFn: () => Promise<T>,
  deps: DependencyList = []
): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;
    setState((s) => ({ ...s, isLoading: true, error: null }));

    asyncFn()
      .then((data) => {
        if (isMounted) {
          setState({ data, isLoading: false, error: null });
        }
      })
      .catch((error) => {
        if (isMounted) {
          setState({ data: null, isLoading: false, error });
        }
      });

    return () => {
      isMounted = false;
    };
  }, deps);

  return state;
}
```

#### `useFirestoreSubscription.ts`

```typescript
// Replaces pattern in Chats.tsx, ChatRoom.tsx, uiStore.ts
import { useState, useEffect, type DependencyList } from 'react';

export function useFirestoreSubscription<T>(
  subscribeFn: (callback: (data: T) => void) => () => void,
  deps: DependencyList = []
): { data: T | null; isLoading: boolean } {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeFn((newData) => {
      setData(newData);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, deps);

  return { data, isLoading };
}
```

#### Additional Hooks Needed

| Hook | Purpose |
|------|---------|
| `useClickOutside.ts` | For DatePicker dropdown closing |
| `useDebounce.ts` | For search input in Explore.tsx |
| `useConnectToListing.ts` | For chat creation logic in Explore/Matches |

---

### 3. Extract ListingCard Component

**Problem:** Listing card UI duplicated in Dashboard.tsx, Explore.tsx, Profile.tsx

**Current (repeated 3x):**

```tsx
<Card hover padding="md">
  <Badge variant={listing.type === 'offer' ? 'success' : 'primary'}>
    {listing.type === 'offer' ? 'Offering' : 'Requesting'}
  </Badge>
  <h3>{listing.title}</h3>
  {listing.tags.map(tag => <Badge variant="outline">{tag}</Badge>)}
</Card>
```

**Solution:** Create `src/components/features/listings/ListingCard.tsx`

```tsx
import type { Listing } from '../../../types';

interface ListingCardProps {
  listing: Listing;
  onConnect?: () => void;
  onEdit?: () => void;
  showActions?: boolean;
  showUserInfo?: boolean;
}

export function ListingCard({
  listing,
  onConnect,
  onEdit,
  showActions = true,
  showUserInfo = true,
}: ListingCardProps) {
  // Unified implementation with all variants
}
```

---

### 4. Fix Dark Mode Inconsistencies

**Problem:** Several components use hardcoded colors instead of CSS variables

| File | Issue |
|------|-------|
| `Skeleton.tsx` | Uses `bg-gray-200`, `bg-gray-300` |
| `Spinner.tsx` | Uses `text-indigo-600` |
| `Alert.tsx` | Hardcoded `bg-blue-50`, `text-blue-800`, etc. |
| `ToastContainer.tsx` | Hardcoded colors per variant |
| `CollegeVerification.tsx` | Entire page lacks dark mode |

**Fix Pattern:**

```tsx
// Before
className="bg-gray-200"

// After
className="bg-[var(--color-surface-200)] dark:bg-[var(--color-surface-700)]"
```

---

### 5. Add Error Boundaries

**Problem:** No error handling for React component crashes

**Solution:** Create `src/components/layout/ErrorBoundary.tsx`

```tsx
import { Component, type ReactNode } from 'react';
import { Button } from '../ui';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
            <h2 className="text-xl font-bold mb-4">Something went wrong</h2>
            <p className="text-[var(--text-secondary)] mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <Button onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
```

---

### 6. Modal Accessibility Fixes

**Problem:** Modal lacks proper ARIA attributes and focus management

**Current Issues:**

- No `role="dialog"` or `aria-modal="true"`
- No focus trap (users can tab outside modal)
- No escape key handler
- No AnimatePresence for exit animations

**Fix in `Modal.tsx`:**

```tsx
import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export function Modal({ isOpen, onClose, title, children, ... }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Focus trap and initial focus
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          tabIndex={-1}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <h2 id="modal-title">{title}</h2>
          {children}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
```

---

### 7. Introduce TanStack Query for Server State

**Problem:** Manual data fetching with useState/useEffect in every page

**Current Pattern (Dashboard.tsx):**

```tsx
const [listings, setListings] = useState<Listing[]>([]);
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  async function fetchListings() {
    setIsLoading(true);
    const data = await getUserListings(user.id);
    setListings(data);
    setIsLoading(false);
  }
  fetchListings();
}, [user]);
```

**With TanStack Query:**

```tsx
import { useQuery } from '@tanstack/react-query';

const { data: listings = [], isLoading } = useQuery({
  queryKey: ['listings', 'user', user?.id],
  queryFn: () => getUserListings(user!.id),
  enabled: !!user,
});
```

**Benefits:**

- Automatic caching
- Request deduplication
- Background refetching
- Optimistic updates (built-in)
- DevTools for debugging
- Retry logic

**Installation:**

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

---

## Medium Priority Improvements

### 8. Add Firestore Transactions

**Problem:** `sendMessage` updates multiple documents without atomicity

**Location:** `src/services/chat.ts:73-92`

```typescript
// Current: Two separate writes (not atomic)
await addDoc(collection(db, `chats/${chatId}/messages`), { ... });
await updateDoc(doc(db, 'chats', chatId), { ... });
```

**Fix with Transaction:**

```typescript
import { runTransaction } from 'firebase/firestore';

export async function sendMessage(
  chatId: string,
  senderId: string,
  text: string
): Promise<Message> {
  return runTransaction(db, async (transaction) => {
    const chatRef = doc(db, 'chats', chatId);
    const chatSnap = await transaction.get(chatRef);

    if (!chatSnap.exists()) {
      throw new Error('Chat not found');
    }

    const messagesRef = doc(collection(db, `chats/${chatId}/messages`));
    const messageData = {
      chatId,
      senderId,
      text,
      createdAt: serverTimestamp(),
    };

    transaction.set(messagesRef, messageData);
    transaction.update(chatRef, {
      lastMessage: text,
      lastMessageAt: serverTimestamp(),
      lastMessageSenderId: senderId,
      [`unreadCount.${getOtherParticipantId(chatSnap.data(), senderId)}`]:
        increment(1),
    });

    return { id: messagesRef.id, ...messageData } as Message;
  });
}
```

---

### 9. Consolidate ChatRoom State

**Problem:** ChatRoom.tsx has 12 useState calls

**Current:**

```tsx
const [chat, setChat] = useState<Chat | null>(null);
const [messages, setMessages] = useState<Message[]>([]);
const [newMessage, setNewMessage] = useState('');
const [isLoading, setIsLoading] = useState(true);
const [isSending, setIsSending] = useState(false);
const [showBookingModal, setShowBookingModal] = useState(false);
const [bookingDate, setBookingDate] = useState('');
const [bookingTime, setBookingTime] = useState('');
const [bookingDuration, setBookingDuration] = useState('60');
const [bookingLocation, setBookingLocation] = useState('');
const [bookingNotes, setBookingNotes] = useState('');
const [isBooking, setIsBooking] = useState(false);
```

**Solution:** Use useReducer for booking form:

```typescript
interface BookingFormState {
  date: string;
  time: string;
  duration: string;
  location: string;
  notes: string;
  isSubmitting: boolean;
  showModal: boolean;
}

type BookingAction =
  | { type: 'SET_FIELD'; field: keyof BookingFormState; value: string | boolean }
  | { type: 'RESET' }
  | { type: 'OPEN_MODAL' }
  | { type: 'CLOSE_MODAL' }
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_END' };

const initialBookingState: BookingFormState = {
  date: '',
  time: '',
  duration: '60',
  location: '',
  notes: '',
  isSubmitting: false,
  showModal: false,
};

function bookingReducer(state: BookingFormState, action: BookingAction): BookingFormState {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'RESET':
      return initialBookingState;
    case 'OPEN_MODAL':
      return { ...state, showModal: true };
    case 'CLOSE_MODAL':
      return { ...state, showModal: false };
    case 'SUBMIT_START':
      return { ...state, isSubmitting: true };
    case 'SUBMIT_END':
      return { ...state, isSubmitting: false };
    default:
      return state;
  }
}

// Usage
const [bookingForm, dispatch] = useReducer(bookingReducer, initialBookingState);
```

---

### 10. Centralize Date/Time Formatters

**Problem:** `formatTime` implemented 3 times across files

**Files Affected:**

- `Chats.tsx:formatTime()`
- `ChatRoom.tsx:formatMessageTime()`
- `Bookings.tsx:formatTime()`, `formatDate()`

**Solution:** Add to `src/lib/utils.ts`:

```typescript
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import type { Timestamp } from 'firebase/firestore';

/**
 * Format a Firestore timestamp for chat list display
 * Shows time for today, "Yesterday" for yesterday, or date for older
 */
export function formatChatListTime(timestamp: Timestamp | null): string {
  if (!timestamp) return '';
  const date = timestamp.toDate();

  if (isToday(date)) {
    return format(date, 'h:mm a');
  }
  if (isYesterday(date)) {
    return 'Yesterday';
  }
  return format(date, 'MMM d');
}

/**
 * Format a Firestore timestamp for message display
 * Shows time only (messages are grouped by date)
 */
export function formatMessageTime(timestamp: Timestamp | null): string {
  if (!timestamp) return '';
  return format(timestamp.toDate(), 'h:mm a');
}

/**
 * Format a date string for booking display
 */
export function formatBookingDate(dateStr: string): string {
  return format(new Date(dateStr), 'EEEE, MMMM d, yyyy');
}

/**
 * Format a time string (HH:MM) to 12-hour format
 */
export function formatBookingTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Format a relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(timestamp: Timestamp | null): string {
  if (!timestamp) return '';
  return formatDistanceToNow(timestamp.toDate(), { addSuffix: true });
}
```

---

### 11. Secure Verification Codes

**Problem:** Verification codes stored in user document readable by any authenticated user

**Current Security Rules:**

```
match /users/{userId} {
  allow read: if isAuthenticated();  // Anyone can read verification codes!
}
```

**Solution A - Protected Subcollection:**

```
// firestore.rules
match /users/{userId}/private/{docId} {
  allow read, write: if isOwner(userId);
}
```

Move verification data to `/users/{userId}/private/verification`

**Solution B - Cloud Functions (Recommended):**

```typescript
// functions/src/verification.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const sendVerificationCode = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // Store code securely (not readable by client)
  await admin.firestore()
    .collection('verificationCodes')
    .doc(context.auth.uid)
    .set({
      code,
      email: data.email,
      expiresAt: admin.firestore.Timestamp.fromDate(
        new Date(Date.now() + 10 * 60 * 1000)
      ),
    });

  // Send email via SendGrid/Nodemailer
  // await sendEmail(data.email, code);

  return { success: true };
});
```

---

### 12. Add Route-Based Code Splitting

**Problem:** All pages bundled together (~500KB+ initial bundle)

**Solution in App.tsx:**

```tsx
import { lazy, Suspense } from 'react';
import { LoadingScreen } from './components/ui';

// Lazy load all page components
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Explore = lazy(() => import('./pages/Explore'));
const CreateListing = lazy(() => import('./pages/CreateListing'));
const Matches = lazy(() => import('./pages/Matches'));
const Chats = lazy(() => import('./pages/Chats'));
const ChatRoom = lazy(() => import('./pages/ChatRoom'));
const Bookings = lazy(() => import('./pages/Bookings'));
const Profile = lazy(() => import('./pages/Profile'));
const CollegeVerification = lazy(() => import('./pages/CollegeVerification'));

// Wrap routes with Suspense
<Route
  path={ROUTES.dashboard}
  element={
    <ProtectedRoute>
      <MainLayout>
        <Suspense fallback={<LoadingScreen />}>
          <Dashboard />
        </Suspense>
      </MainLayout>
    </ProtectedRoute>
  }
/>
```

**Note:** Each page file needs `export default` (already present).

---

## Low Priority Improvements

### 13. Add forwardRef to Remaining Components

**Components Missing forwardRef:**

| Component | Priority |
|-----------|----------|
| `Alert.tsx` | Low |
| `Select.tsx` | Medium (form integration) |
| `TagInput.tsx` | Low |
| `DatePicker.tsx` | Low |
| `TimeInput.tsx` | Low |
| `Modal.tsx` | Low |
| `EmptyState.tsx` | Low |

---

### 14. Differentiate Card Variants

**Problem:** `bordered` and `elevated` Card variants have identical styles

**Location:** `src/components/ui/Card.tsx:27-28`

```typescript
// Current: Both are the same
bordered: 'border-2',
elevated: 'border-2',
```

**Fix:**

```typescript
const variants = {
  default: 'border-2 border-[var(--border-default)]',
  bordered: 'border-2 border-[var(--border-highlight)]',
  elevated: 'border-2 border-[var(--border-default)] shadow-lg',
  ghost: 'border-0 bg-transparent shadow-none',
};
```

---

### 15. Add Zustand DevTools

**Solution:**

```typescript
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export const useAuthStore = create<AuthState>()(
  devtools(
    (set, get) => ({
      // ... store implementation
    }),
    { name: 'auth-store', enabled: import.meta.env.DEV }
  )
);

export const useUIStore = create<UIState>()(
  devtools(
    (set, get) => ({
      // ... store implementation
    }),
    { name: 'ui-store', enabled: import.meta.env.DEV }
  )
);
```

---

### 16. Add Pre-commit Hooks

**Setup:**

```bash
npm install -D husky lint-staged
npx husky init
```

**`.husky/pre-commit`:**

```bash
#!/usr/bin/env sh
npx lint-staged
```

**`package.json`:**

```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix --max-warnings=0",
      "prettier --write"
    ],
    "*.{json,md,css}": [
      "prettier --write"
    ]
  }
}
```

---

### 17. Add Testing Infrastructure

**Installation:**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

**`vite.config.ts`:**

```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'src/test/'],
    },
  },
});
```

**`src/test/setup.ts`:**

```typescript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
```

**`package.json` scripts:**

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage"
  }
}
```

---

## Implementation Roadmap

### Phase 1: Critical Security (Day 1)

- [ ] Remove hardcoded API keys from `scripts/seed-data.ts`
- [ ] Verify `.env` is in `.gitignore` (already present)
- [ ] Set `demoMode: false` in `src/services/verification.ts` for production

### Phase 2: DRY & Custom Hooks (Days 2-3)

- [ ] Create `src/hooks/useAsync.ts`
- [ ] Create `src/hooks/useFirestoreSubscription.ts`
- [ ] Create `src/hooks/useClickOutside.ts`
- [ ] Create `src/hooks/useDebounce.ts`
- [ ] Create `src/hooks/useConnectToListing.ts`
- [ ] Create `src/hooks/index.ts` barrel export
- [ ] Extract `src/components/features/listings/ListingCard.tsx`
- [ ] Centralize date/time formatters in `src/lib/utils.ts`
- [ ] Update Dashboard, Explore, Profile to use ListingCard
- [ ] Update Chats, ChatRoom, Bookings to use centralized formatters

### Phase 3: Data Layer (Days 4-5)

- [ ] Install TanStack Query (`npm install @tanstack/react-query`)
- [ ] Create `src/lib/queryClient.ts` with default config
- [ ] Wrap App with `QueryClientProvider`
- [ ] Migrate Dashboard data fetching to useQuery
- [ ] Migrate Explore data fetching to useQuery
- [ ] Migrate Profile data fetching to useQuery
- [ ] Migrate Matches data fetching to useQuery
- [ ] Add Firestore transactions for `sendMessage`
- [ ] Add Firestore transactions for `createBooking`

### Phase 4: Styling & Accessibility (Days 6-7)

- [ ] Fix dark mode in `Skeleton.tsx`
- [ ] Fix dark mode in `Spinner.tsx`
- [ ] Fix dark mode in `Alert.tsx`
- [ ] Fix dark mode in `ToastContainer.tsx`
- [ ] Add dark mode to `CollegeVerification.tsx`
- [ ] Create `ErrorBoundary.tsx`
- [ ] Wrap routes with ErrorBoundary in App.tsx
- [ ] Fix Modal accessibility (ARIA attributes)
- [ ] Add focus trap to Modal
- [ ] Add escape key handler to Modal
- [ ] Add AnimatePresence to Modal
- [ ] Audit and fix form label associations

### Phase 5: Performance & DX (Days 8-10)

- [ ] Add route-based code splitting with React.lazy
- [ ] Add `loading="lazy"` to Avatar and other images
- [ ] Add `useMemo` for expensive computations in Explore filtering
- [ ] Add `useCallback` for stable handler references
- [ ] Install and configure Vitest
- [ ] Write tests for critical hooks
- [ ] Write tests for auth flow
- [ ] Add Zustand devtools middleware
- [ ] Set up Husky + lint-staged pre-commit hooks

---

## Appendix: File Reference

### Files to Create

| Path | Purpose |
|------|---------|
| `src/hooks/useAsync.ts` | Generic async state hook |
| `src/hooks/useFirestoreSubscription.ts` | Firestore real-time subscription hook |
| `src/hooks/useClickOutside.ts` | Click outside detection |
| `src/hooks/useDebounce.ts` | Debounced value hook |
| `src/hooks/useConnectToListing.ts` | Chat creation logic |
| `src/hooks/index.ts` | Barrel exports |
| `src/components/features/listings/ListingCard.tsx` | Unified listing card |
| `src/components/features/listings/index.ts` | Barrel exports |
| `src/components/layout/ErrorBoundary.tsx` | Error boundary wrapper |
| `src/lib/queryClient.ts` | TanStack Query client config |
| `src/test/setup.ts` | Vitest setup file |

### Files to Modify

| Path | Changes |
|------|---------|
| `scripts/seed-data.ts` | Remove hardcoded API keys, use env vars |
| `src/services/verification.ts` | Disable demo mode for production |
| `src/services/chat.ts` | Add Firestore transactions |
| `src/components/ui/Skeleton.tsx` | Use CSS variables for colors |
| `src/components/ui/Spinner.tsx` | Use CSS variables for colors |
| `src/components/ui/Alert.tsx` | Use CSS variables for colors |
| `src/components/ui/Card.tsx` | Differentiate variants |
| `src/components/ui/Modal.tsx` | Add ARIA, focus trap, AnimatePresence |
| `src/components/layout/ToastContainer.tsx` | Use CSS variables for colors |
| `src/components/layout/index.ts` | Export ErrorBoundary |
| `src/pages/CollegeVerification.tsx` | Add dark mode support |
| `src/pages/Dashboard.tsx` | Use ListingCard, useQuery |
| `src/pages/Explore.tsx` | Use ListingCard, useQuery, useDebounce |
| `src/pages/Profile.tsx` | Use ListingCard, useQuery |
| `src/pages/Matches.tsx` | Use useQuery |
| `src/pages/Chats.tsx` | Use centralized formatters |
| `src/pages/ChatRoom.tsx` | Use useReducer for booking form |
| `src/pages/Bookings.tsx` | Use centralized formatters |
| `src/App.tsx` | Add ErrorBoundary, lazy loading, QueryClientProvider |
| `src/lib/utils.ts` | Add centralized date/time formatters |
| `src/stores/authStore.ts` | Add devtools middleware |
| `src/stores/uiStore.ts` | Add devtools middleware |
| `package.json` | Add TanStack Query, Vitest, Husky deps |
| `vite.config.ts` | Add Vitest config |
| `firestore.rules` | Add protected subcollection rules |

### Dependencies to Add

```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.x"
  },
  "devDependencies": {
    "@tanstack/react-query-devtools": "^5.x",
    "vitest": "^2.x",
    "@testing-library/react": "^16.x",
    "@testing-library/jest-dom": "^6.x",
    "@testing-library/user-event": "^14.x",
    "jsdom": "^25.x",
    "husky": "^9.x",
    "lint-staged": "^15.x"
  }
}
```

---

*This plan is designed to incrementally improve the codebase while maintaining stability. Each phase builds on the previous one and can be deployed independently.*
