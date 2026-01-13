import type { ReactNode } from 'react';
import { Header } from './Header';
import { ToastContainer } from './ToastContainer';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <ToastContainer />
    </div>
  );
}
