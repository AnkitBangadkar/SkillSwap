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
