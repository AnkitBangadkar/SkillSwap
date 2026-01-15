# Agent Instructions for SkillSwap

## Project Overview
SkillSwap is a peer-to-peer campus skill-sharing marketplace built with React 19, TypeScript, TailwindCSS v4, Firebase (Auth, Firestore), and Google Gemini AI.

---

## Build & Development Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install dependencies |
| `npm run dev` | Start development server (Vite) |
| `npm run build` | TypeScript check + production build |
| `npm run lint` | Run ESLint on all files |
| `npm run preview` | Preview production build locally |
| `tsc -b` | TypeScript type-check only (no emit) |

### Testing
No test framework currently installed (Hackathon MVP). When adding tests:
- Use Vitest (recommended for Vite projects)
- Place tests in `__tests__/` folders or `*.test.tsx` files
- Run single test: `npx vitest run path/to/file.test.tsx`

---

## Project Structure

```
src/
├── components/
│   ├── ui/           # Atomic, reusable UI components (Button, Card, Modal)
│   └── layout/       # Page wrappers, Header, Sidebar
├── pages/            # Route-level components (Dashboard, Explore, ChatRoom)
├── services/         # Firebase, Gemini AI, and API logic
├── stores/           # Zustand state stores (authStore, uiStore)
├── types/            # TypeScript interfaces and types (index.ts)
├── lib/              # Utilities (utils.ts, constants.ts)
├── hooks/            # Custom React hooks
└── assets/           # Static assets (images, icons)
```

---

## TypeScript Configuration

**Key settings from `tsconfig.app.json`:**
- `strict: true` - Full strict mode enabled
- `verbatimModuleSyntax: true` - MUST use `import type` for type-only imports
- `erasableSyntaxOnly: true` - No enums allowed, use string unions instead
- `target: ES2022` - Modern JavaScript features available

### Type Import Rules
```tsx
// CORRECT - use 'import type' for types
import type { User, Listing } from '../types';
import { useState } from 'react';

// WRONG - will cause build errors
import { User, Listing } from '../types';
```

### No Enums - Use String Unions
```tsx
// WRONG - enums not allowed
enum Status { Active, Paused }

// CORRECT - use string union types
type Status = 'active' | 'paused' | 'completed';
```

---

## Code Style Guidelines

### Naming Conventions
| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `ListingCard.tsx` |
| Hooks | camelCase with `use` prefix | `useAuth.ts` |
| Services | camelCase | `gemini.ts`, `firebase.ts` |
| Constants | UPPER_SNAKE_CASE | `APP_CONFIG`, `ROUTES` |
| Types/Interfaces | PascalCase | `User`, `Listing` |
| Files | PascalCase (components), camelCase (others) | `Button.tsx`, `utils.ts` |

### Import Order
1. React and external libraries
2. Internal components (absolute paths not configured - use relative)
3. Hooks and stores
4. Services and utilities
5. Types (with `import type`)
6. Assets and styles

```tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Sparkles } from 'lucide-react';
import { Button, Card } from '../components/ui';
import { useAuthStore } from '../stores/authStore';
import { generateTagSuggestions } from '../services/gemini';
import { cn } from '../lib/utils';
import type { Listing, User } from '../types';
```

### Barrel Exports
Use `index.ts` files for cleaner imports:
```tsx
// src/components/ui/index.ts
export { Button } from './Button';
export { Card } from './Card';

// Usage
import { Button, Card } from '../components/ui';
```

---

## Styling (TailwindCSS v4)

- **Utility-first:** Prefer Tailwind classes over custom CSS
- **Dynamic classes:** Use `cn()` from `src/lib/utils.ts` for conditional classes
- **Theme variables:** CSS variables in `src/index.css` for colors

```tsx
import { cn } from '../../lib/utils';

<div className={cn(
  'rounded-lg p-4',
  isActive && 'bg-indigo-500 text-white',
  className
)} />
```

---

## State Management

### Zustand Stores (`src/stores/`)
- `authStore.ts` - User authentication state
- `uiStore.ts` - Theme, toasts, notifications, sidebar

```tsx
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';

const { user, isAuthenticated } = useAuthStore();
const { showToast, theme } = useUIStore();
```

### Firebase Subscriptions
Always return cleanup functions from `useEffect`:
```tsx
useEffect(() => {
  const unsubscribe = onSnapshot(query, (snapshot) => {
    // handle data
  });
  return () => unsubscribe(); // CRITICAL: cleanup
}, [dependencies]);
```

---

## Error Handling

### User-Facing Errors
```tsx
const { showToast } = useUIStore();

showToast({ type: 'error', message: 'Failed to save. Please try again.' });
showToast({ type: 'success', message: 'Listing created!' });
showToast({ type: 'warning', message: 'Please fill all required fields.' });
```

### AI/Gemini Errors
The `gemini.ts` service handles errors automatically with:
- Model fallback: `gemini-2.5-flash` → `gemini-2.0-flash` → `gemini-2.5-pro`
- API key rotation (comma-separated keys in `VITE_GEMINI_API_KEY`)
- Exponential backoff retry
- Graceful fallbacks (never throws to UI)

---

## Component Blueprint

```tsx
import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
}

export const MyButton = forwardRef<HTMLButtonElement, Props>(
  ({ className, variant = 'primary', isLoading, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'px-4 py-2 rounded-lg font-medium transition-colors',
          variant === 'primary' && 'bg-indigo-600 text-white hover:bg-indigo-700',
          variant === 'secondary' && 'bg-gray-100 text-gray-900 hover:bg-gray-200',
          className
        )}
        disabled={isLoading}
        {...props}
      >
        {isLoading ? <Loader2 className="animate-spin" /> : children}
      </button>
    );
  }
);
```

---

## Security & Environment

### Environment Variables
Access via `import.meta.env.VITE_*`:
```tsx
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
```

Required `.env` variables:
- `VITE_FIREBASE_*` - Firebase configuration
- `VITE_GEMINI_API_KEY` - Gemini AI key(s), comma-separated for rotation

### Firebase Security
- Always update `firestore.rules` when adding new collections
- Never trust client-side data - validate in security rules
- Use `auth.uid` for user-specific data access

---

## Key Libraries

| Package | Usage |
|---------|-------|
| `react-router-dom` | Routing (`ROUTES` in `constants.ts`) |
| `zustand` | Global state management |
| `firebase` | Auth, Firestore database |
| `@google/generative-ai` | Gemini AI integration |
| `lucide-react` | Icons |
| `framer-motion` | Animations |
| `date-fns` | Date formatting |
| `clsx` + `tailwind-merge` | Class name utilities |

---

## Common Patterns

### Loading States
```tsx
const [isLoading, setIsLoading] = useState(false);

{isLoading ? (
  <Loader2 className="h-6 w-6 animate-spin" />
) : (
  <Content />
)}
```

### Form Validation
```tsx
const [errors, setErrors] = useState<Record<string, string>>({});

const validate = (): boolean => {
  const newErrors: Record<string, string> = {};
  if (!title.trim()) newErrors.title = 'Title is required';
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

### Firestore Timestamps
```tsx
import { Timestamp } from 'firebase/firestore';
import type { Listing } from '../types';

// In interfaces, use Timestamp for dates
createdAt: Timestamp;

// Convert to Date for display
const date = listing.createdAt.toDate();
```
