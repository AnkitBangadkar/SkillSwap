import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { Button, Alert } from '../components/ui';
import { useAuthStore } from '../stores/authStore';
import { ROUTES, APP_CONFIG } from '../lib/constants';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, isAuthenticated, error, clearError, isFirebaseReady } = useAuthStore();

  // Get the redirect path from location state, or default to dashboard
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || ROUTES.dashboard;

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const handleLogin = async () => {
    await login();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 bg-indigo-600 rounded-2xl mb-4">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{APP_CONFIG.name}</h1>
          <p className="text-gray-600 mt-1">Sign in to continue</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Firebase not configured warning */}
          {!isFirebaseReady && (
            <Alert variant="warning" title="Setup Required" className="mb-6">
              Firebase is not configured. Please add your Firebase credentials to the .env file.
            </Alert>
          )}

          {/* Error message */}
          {error && (
            <Alert variant="error" className="mb-6">
              {error}
            </Alert>
          )}

          {/* Google Sign In Button */}
          <Button
            onClick={handleLogin}
            isLoading={isLoading}
            disabled={!isFirebaseReady}
            className="w-full"
            size="lg"
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </Button>

          {/* Two-step verification notice */}
          <p className="mt-6 text-center text-sm text-gray-500">
            Sign in with any Google account. You'll verify your{' '}
            <span className="font-medium">@{APP_CONFIG.allowedEmailDomains[0]}</span>{' '}
            email next.
          </p>
        </div>

        {/* Back to home */}
        <p className="mt-6 text-center text-sm text-gray-500">
          <a href={ROUTES.home} className="text-indigo-600 hover:text-indigo-700 font-medium">
            Back to home
          </a>
        </p>
      </div>
    </div>
  );
}
