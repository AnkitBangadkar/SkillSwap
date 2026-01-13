# Agent Instructions for SkillSwap

## Project Overview
SkillSwap is a peer-to-peer campus skill-sharing marketplace built with React, TypeScript, TailwindCSS, Firebase (Auth, Firestore), and Google Gemini AI.

## 🛠 Build & Development
- **Install Dependencies:** `npm install`
- **Development Server:** `npm run dev`
- **Production Build:** `npm run build`
- **Linting:** `npm run lint` (uses ESLint)
- **TypeScript Check:** `tsc -b`
- **Testing:** No test framework currently installed (Hackathon MVP).

## 🎨 Code Style & Conventions

### 1. TypeScript & Types
- **Strict Typing:** Always use interfaces or types for props and data models.
- **Type-Only Imports:** Use `import type { ... }` for types to satisfy `verbatimModuleSyntax`.
- **Location:** Project-wide types reside in `src/types/index.ts`.
- **Firebase Types:** Use `Timestamp` from `firebase/firestore` for date fields in models.

### 2. File Structure & Imports
- **Component Organization:**
  - `src/components/ui/`: Atomic, reusable UI elements.
  - `src/components/layout/`: Page wrappers, headers, global UI.
  - `src/pages/`: Main route components.
- **Absolute Imports:** Use relative paths (e.g., `../../lib/utils`).
- **Barrel Files:** Use `index.ts` in folders for cleaner imports (e.g., `import { Button } from '../ui'`).

### 3. Styling (TailwindCSS v4)
- **Utility-First:** Prefer Tailwind classes over custom CSS.
- **Dynamic Classes:** Use the `cn()` utility from `src/lib/utils.ts` for conditional classes.
- **Theme Variables:** Use CSS variables defined in `src/index.css` for primary colors.

### 4. Naming Conventions
- **Components:** PascalCase (e.g., `ListingCard.tsx`).
- **Hooks:** camelCase starting with `use` (e.g., `useAuth.ts`).
- **Constants:** UPPER_SNAKE_CASE (e.g., `APP_CONFIG`).
- **Services:** camelCase (e.g., `firebase.ts`, `gemini.ts`).

### 5. State Management
- **Zustand:** Use Zustand for global state (Auth, UI/Toasts). Stores are in `src/stores/`.
- **Firebase Listeners:** Use `useEffect` to manage Firestore subscriptions and ensure cleanup functions are returned.

### 6. Error Handling
- **Toasts:** Use `useUIStore().showToast({ type: 'error', message: '...' })` for user-facing errors.
- **Auth Errors:** Reference `AUTH_ERRORS` in `src/services/auth.ts`.
- **Graceful Fallbacks:** Always provide fallbacks for Gemini AI failures (defined in `src/services/gemini.ts`).

## 🧱 Component Blueprint
```tsx
import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

export const MyComponent = forwardRef<HTMLButtonElement, Props>(
  ({ className, variant = 'primary', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn('base-styles', variant === 'primary' && 'p-styles', className)}
        {...props}
      />
    );
  }
);
```

## 🔐 Security & Firebase
- **Security Rules:** Always update `firestore.rules` when adding new collections.
- **Environment Variables:** Access via `import.meta.env.VITE_...`.
- **Google Tech:** Prioritize Firebase and Gemini for all infrastructure and AI needs.
