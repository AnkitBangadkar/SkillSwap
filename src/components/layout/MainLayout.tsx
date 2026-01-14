import { useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Header } from './Header';
import { ToastContainer } from './ToastContainer';
import { PageTransition } from './PageTransition';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] transition-colors duration-300 overflow-x-hidden relative">
      {/* Dynamic Background Gradient */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[var(--color-primary-100)]/30 dark:bg-[var(--color-primary-900)]/10 blur-[120px] animate-blob" />
        <div className="absolute top-[40%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-100/30 dark:bg-cyan-900/10 blur-[100px] animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] rounded-full bg-purple-100/30 dark:bg-purple-900/10 blur-[100px] animate-blob animation-delay-4000" />
      </div>

      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <PageTransition key={location.pathname}>
          {children}
        </PageTransition>
      </main>
      
      <ToastContainer />
    </div>
  );
}
