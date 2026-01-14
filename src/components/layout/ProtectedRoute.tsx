import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { LoadingScreen } from '../ui';
import { ROUTES } from '../../lib/constants';
import { isUserVerified } from '../../services/verification';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireVerification?: boolean; // Whether to require college verification
}

export function ProtectedRoute({ children, requireVerification = true }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  if (!isAuthenticated) {
    // Redirect to login, but save the attempted URL
    return <Navigate to={ROUTES.login} state={{ from: location }} replace />;
  }

  // Check if college verification is required and not completed
  if (requireVerification && !isUserVerified(user)) {
    // Don't redirect if already on verification page
    if (location.pathname !== ROUTES.verifyCollege) {
      return <Navigate to={ROUTES.verifyCollege} replace />;
    }
  }

  return <>{children}</>;
}
