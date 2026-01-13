import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { LoadingScreen } from '../ui';
import { ROUTES } from '../../lib/constants';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  if (!isAuthenticated) {
    // Redirect to login, but save the attempted URL
    return <Navigate to={ROUTES.login} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
