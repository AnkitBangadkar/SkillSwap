import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout, ProtectedRoute } from './components/layout';
import {
  Landing,
  Login,
  Dashboard,
  Explore,
  CreateListing,
  Matches,
  Chats,
  ChatRoom,
  Bookings,
  Profile,
} from './pages';
import { useAuthStore } from './stores/authStore';
import { ROUTES } from './lib/constants';
import { LoadingScreen } from './components/ui';

function App() {
  const { initialize, isLoading, isAuthenticated } = useAuthStore();

  useEffect(() => {
    const unsubscribe = initialize();
    return () => unsubscribe();
  }, [initialize]);

  if (isLoading) {
    return <LoadingScreen message="Loading SkillSwap..." />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path={ROUTES.home}
          element={
            isAuthenticated ? <Navigate to={ROUTES.dashboard} replace /> : <Landing />
          }
        />
        <Route
          path={ROUTES.login}
          element={
            isAuthenticated ? <Navigate to={ROUTES.dashboard} replace /> : <Login />
          }
        />

        {/* Protected Routes */}
        <Route
          path={ROUTES.dashboard}
          element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.explore}
          element={
            <ProtectedRoute>
              <MainLayout>
                <Explore />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.createListing}
          element={
            <ProtectedRoute>
              <MainLayout>
                <CreateListing />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.matches}
          element={
            <ProtectedRoute>
              <MainLayout>
                <Matches />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.chats}
          element={
            <ProtectedRoute>
              <MainLayout>
                <Chats />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/chats/:chatId"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ChatRoom />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.bookings}
          element={
            <ProtectedRoute>
              <MainLayout>
                <Bookings />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.profile}
          element={
            <ProtectedRoute>
              <MainLayout>
                <Profile />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
