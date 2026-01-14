import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Shield, ArrowRight, RefreshCw } from 'lucide-react';
import { Button, Input, Alert } from '../components/ui';
import { useAuthStore } from '../stores/authStore';
import { ROUTES } from '../lib/constants';
import {
    sendVerificationCode,
    verifyCode,
    isUserVerified,
    getRequiredDomain,
} from '../services/verification';
import { getCurrentUser } from '../services/auth';

export default function CollegeVerification() {
    const navigate = useNavigate();
    const { user, isAuthenticated, refreshUser } = useAuthStore();

    const [collegeEmail, setCollegeEmail] = useState('');
    const [verificationCodeInput, setVerificationCodeInput] = useState('');
    const [step, setStep] = useState<'email' | 'code'>('email');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [demoCode, setDemoCode] = useState<string | null>(null);

    const requiredDomain = getRequiredDomain();

    // Check if already verified
    useEffect(() => {
        if (!isAuthenticated) {
            navigate(ROUTES.login, { replace: true });
            return;
        }

        if (user && isUserVerified(user)) {
            navigate(ROUTES.dashboard, { replace: true });
        }
    }, [isAuthenticated, user, navigate]);

    const handleSendCode = async () => {
        if (!user) return;

        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const result = await sendVerificationCode(user.id, collegeEmail);

            if (result.success) {
                setSuccess(result.message);
                setStep('code');
                if (result.demoCode) {
                    setDemoCode(result.demoCode);
                }
            } else {
                setError(result.message);
            }
        } catch {
            setError('Failed to send verification code. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        if (!user) return;

        setIsLoading(true);
        setError(null);

        try {
            // Refresh user data to get the latest verification code
            const freshUser = await getCurrentUser();
            if (!freshUser) {
                setError('Session expired. Please log in again.');
                return;
            }

            const result = await verifyCode(freshUser, verificationCodeInput);

            if (result.success) {
                setSuccess(result.message);
                // Refresh user in authStore to get updated isCollegeVerified
                await refreshUser();
                // Short delay to show success message
                setTimeout(() => {
                    navigate(ROUTES.dashboard, { replace: true });
                }, 1500);
            } else {
                setError(result.message);
            }
        } catch {
            setError('Verification failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        setStep('email');
        setVerificationCodeInput('');
        setError(null);
        setSuccess(null);
        setDemoCode(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center h-16 w-16 bg-indigo-600 rounded-2xl mb-4">
                        <Sparkles className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Verify Your College Email</h1>
                    <p className="text-gray-600 mt-1">
                        One last step to unlock SkillSwap
                    </p>
                </div>

                {/* Verification Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {/* Progress Steps */}
                    <div className="flex items-center justify-center mb-8">
                        <div className={`flex items-center justify-center h-10 w-10 rounded-full ${step === 'email' ? 'bg-indigo-600 text-white' : 'bg-green-500 text-white'}`}>
                            <Mail className="h-5 w-5" />
                        </div>
                        <div className={`h-1 w-16 mx-2 ${step === 'code' ? 'bg-indigo-600' : 'bg-gray-200'}`} />
                        <div className={`flex items-center justify-center h-10 w-10 rounded-full ${step === 'code' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                            <Shield className="h-5 w-5" />
                        </div>
                    </div>

                    {/* Error message */}
                    {error && (
                        <Alert variant="error" className="mb-6">
                            {error}
                        </Alert>
                    )}

                    {/* Success message */}
                    {success && (
                        <Alert variant="success" className="mb-6">
                            {success}
                        </Alert>
                    )}

                    {/* Demo mode notice */}
                    {demoCode && (
                        <Alert variant="info" title="Demo Mode" className="mb-6">
                            Your verification code is: <span className="font-mono font-bold text-lg">{demoCode}</span>
                        </Alert>
                    )}

                    {step === 'email' ? (
                        /* Step 1: Enter College Email */
                        <>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    College Email Address
                                </label>
                                <Input
                                    type="email"
                                    placeholder={`yourname@${requiredDomain}`}
                                    value={collegeEmail}
                                    onChange={(e) => setCollegeEmail(e.target.value)}
                                    className="w-full"
                                />
                                <p className="mt-2 text-sm text-gray-500">
                                    Enter your <span className="font-medium">@{requiredDomain}</span> email
                                </p>
                            </div>

                            <Button
                                onClick={handleSendCode}
                                isLoading={isLoading}
                                disabled={!collegeEmail.endsWith(`@${requiredDomain}`)}
                                className="w-full"
                                size="lg"
                            >
                                Send Verification Code
                                <ArrowRight className="h-5 w-5 ml-2" />
                            </Button>
                        </>
                    ) : (
                        /* Step 2: Enter Verification Code */
                        <>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Verification Code
                                </label>
                                <Input
                                    type="text"
                                    placeholder="Enter 6-digit code"
                                    value={verificationCodeInput}
                                    onChange={(e) => setVerificationCodeInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="w-full text-center text-2xl font-mono tracking-widest"
                                    maxLength={6}
                                />
                                <p className="mt-2 text-sm text-gray-500">
                                    Sent to <span className="font-medium">{collegeEmail}</span>
                                </p>
                            </div>

                            <Button
                                onClick={handleVerifyCode}
                                isLoading={isLoading}
                                disabled={verificationCodeInput.length !== 6}
                                className="w-full mb-4"
                                size="lg"
                            >
                                <Shield className="h-5 w-5 mr-2" />
                                Verify & Continue
                            </Button>

                            <button
                                onClick={handleResendCode}
                                className="w-full text-sm text-indigo-600 hover:text-indigo-700 flex items-center justify-center"
                            >
                                <RefreshCw className="h-4 w-4 mr-1" />
                                Change email or resend code
                            </button>
                        </>
                    )}
                </div>

                {/* Logged in as */}
                {user && (
                    <p className="mt-6 text-center text-sm text-gray-500">
                        Logged in as <span className="font-medium">{user.email}</span>
                    </p>
                )}
            </div>
        </div>
    );
}
