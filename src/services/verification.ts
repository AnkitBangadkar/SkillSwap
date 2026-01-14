import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import type { User } from '../types';
import { APP_CONFIG } from '../lib/constants';
import { isAllowedEmail } from '../lib/utils';

// ============================================
// Verification Configuration
// ============================================

const VERIFICATION_CONFIG = {
    codeLength: 6,
    expiryMinutes: 10,
    // Demo mode: when true, any code works and no email is sent
    demoMode: true, // Set to false in production with real email service
};

// ============================================
// Generate Verification Code
// ============================================

export function generateVerificationCode(): string {
    const digits = '0123456789';
    let code = '';
    for (let i = 0; i < VERIFICATION_CONFIG.codeLength; i++) {
        code += digits.charAt(Math.floor(Math.random() * digits.length));
    }
    return code;
}

// ============================================
// Validate College Email Domain
// ============================================

export function isValidCollegeEmail(email: string): boolean {
    return isAllowedEmail(email);
}

export function getRequiredDomain(): string {
    return APP_CONFIG.allowedEmailDomains[0];
}

// ============================================
// Send Verification Code
// ============================================

export interface SendVerificationResult {
    success: boolean;
    message: string;
    demoCode?: string; // Only returned in demo mode
}

export async function sendVerificationCode(
    userId: string,
    collegeEmail: string
): Promise<SendVerificationResult> {
    // Validate college email domain
    if (!isValidCollegeEmail(collegeEmail)) {
        return {
            success: false,
            message: `Email must be from @${getRequiredDomain()}`,
        };
    }

    // Generate code and expiry
    const code = generateVerificationCode();
    const expiry = Timestamp.fromDate(
        new Date(Date.now() + VERIFICATION_CONFIG.expiryMinutes * 60 * 1000)
    );

    // Store code in user document
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
        collegeEmail,
        verificationCode: code,
        verificationExpiry: expiry,
    });

    if (VERIFICATION_CONFIG.demoMode) {
        // Demo mode: return the code directly (for hackathon testing)
        console.log(`[DEMO] Verification code for ${collegeEmail}: ${code}`);
        return {
            success: true,
            message: `Demo mode: Your verification code is ${code}`,
            demoCode: code,
        };
    }

    // Production mode: would integrate EmailJS or similar here
    // For now, just simulate success
    // TODO: Integrate EmailJS for production
    // await emailjs.send('service_id', 'template_id', {
    //   to_email: collegeEmail,
    //   verification_code: code,
    // });

    return {
        success: true,
        message: `Verification code sent to ${collegeEmail}`,
    };
}

// ============================================
// Verify Code
// ============================================

export interface VerifyCodeResult {
    success: boolean;
    message: string;
}

export async function verifyCode(
    user: User,
    enteredCode: string
): Promise<VerifyCodeResult> {
    // Check if verification is pending
    if (!user.verificationCode || !user.verificationExpiry) {
        return {
            success: false,
            message: 'No verification pending. Please request a new code.',
        };
    }

    // Check if code has expired
    const now = new Date();
    const expiry = user.verificationExpiry.toDate();
    if (now > expiry) {
        return {
            success: false,
            message: 'Verification code has expired. Please request a new one.',
        };
    }

    // Check if code matches
    if (user.verificationCode !== enteredCode) {
        return {
            success: false,
            message: 'Invalid verification code. Please try again.',
        };
    }

    // Success! Update user as verified
    const userRef = doc(db, 'users', user.id);
    await updateDoc(userRef, {
        isCollegeVerified: true,
        verificationCode: null, // Clear the code
        verificationExpiry: null,
    });

    return {
        success: true,
        message: 'College email verified successfully!',
    };
}

// ============================================
// Check Verification Status
// ============================================

export function isUserVerified(user: User | null): boolean {
    return user?.isCollegeVerified ?? false;
}
