import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import type { User, Booking } from '../types';

// ============================================
// Constants
// ============================================

const GOOGLE_CALENDAR_API = 'https://www.googleapis.com/calendar/v3';
const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.events';
const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

// Get client ID from environment
const getClientId = () => import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// ============================================
// Types
// ============================================

interface CalendarEvent {
  id: string;
  htmlLink: string;
  hangoutLink?: string;
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

interface CalendarEventResult {
  success: boolean;
  eventId?: string;
  meetLink?: string;
  error?: string;
}

// ============================================
// OAuth Flow - Using Google Identity Services
// ============================================

/**
 * Initiates Google OAuth flow for calendar access
 * Opens a popup window for user to grant calendar permissions
 */
export async function linkGoogleCalendar(userId: string): Promise<{ success: boolean; error?: string }> {
  const clientId = getClientId();
  
  if (!clientId) {
    return { success: false, error: 'Google Client ID not configured. Add VITE_GOOGLE_CLIENT_ID to .env' };
  }

  try {
    // Generate a random state for CSRF protection
    const state = crypto.randomUUID();
    sessionStorage.setItem('calendar_oauth_state', state);
    sessionStorage.setItem('calendar_oauth_user', userId);

    // Build OAuth URL
    const redirectUri = `${window.location.origin}/auth/calendar/callback`;
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: CALENDAR_SCOPE,
      access_type: 'offline', // Get refresh token
      prompt: 'consent', // Force consent to get refresh token
      state: state,
    });

    // Open popup for OAuth
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    const popup = window.open(
      `${GOOGLE_AUTH_URL}?${params.toString()}`,
      'Google Calendar Authorization',
      `width=${width},height=${height},left=${left},top=${top},popup=yes`
    );

    if (!popup) {
      return { success: false, error: 'Popup blocked. Please allow popups for this site.' };
    }

    // Wait for the callback
    return new Promise((resolve) => {
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          // Check if tokens were saved (callback succeeded)
          checkCalendarLinked(userId).then((linked) => {
            if (linked) {
              resolve({ success: true });
            } else {
              resolve({ success: false, error: 'Authorization cancelled or failed' });
            }
          });
        }
      }, 500);

      // Timeout after 5 minutes
      setTimeout(() => {
        clearInterval(checkClosed);
        if (!popup.closed) {
          popup.close();
        }
        resolve({ success: false, error: 'Authorization timed out' });
      }, 5 * 60 * 1000);
    });
  } catch (error) {
    console.error('Calendar link error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Handle OAuth callback - exchange code for tokens
 * This should be called from a callback route/page
 */
export async function handleCalendarCallback(code: string, state: string): Promise<{ success: boolean; error?: string }> {
  const savedState = sessionStorage.getItem('calendar_oauth_state');
  const userId = sessionStorage.getItem('calendar_oauth_user');

  // Verify state to prevent CSRF
  if (state !== savedState) {
    return { success: false, error: 'Invalid state parameter' };
  }

  if (!userId) {
    return { success: false, error: 'User ID not found' };
  }

  const clientId = getClientId();
  const clientSecret = import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '';

  if (!clientSecret) {
    // For client-side only flow, we need to use implicit grant or a backend
    // Since we're doing client-side, we'll use a simplified approach
    return { success: false, error: 'Client secret not configured for token exchange' };
  }

  try {
    const redirectUri = `${window.location.origin}/auth/calendar/callback`;
    
    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Token exchange error:', error);
      return { success: false, error: 'Failed to exchange authorization code' };
    }

    const tokens: TokenResponse = await response.json();

    // Store tokens in Firestore
    await saveCalendarTokens(userId, tokens);

    // Clean up session storage
    sessionStorage.removeItem('calendar_oauth_state');
    sessionStorage.removeItem('calendar_oauth_user');

    return { success: true };
  } catch (error) {
    console.error('Callback error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Alternative: Link calendar using Google Identity Services (GIS)
 * This is a simpler approach that works better for SPAs
 */
export function linkCalendarWithGIS(userId: string): Promise<{ success: boolean; error?: string }> {
  return new Promise((resolve) => {
    const clientId = getClientId();
    
    if (!clientId) {
      resolve({ success: false, error: 'Google Client ID not configured' });
      return;
    }

    // Check if GIS is loaded
    if (typeof google === 'undefined' || !google.accounts?.oauth2) {
      resolve({ success: false, error: 'Google Identity Services not loaded' });
      return;
    }

    const tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: CALENDAR_SCOPE,
      callback: async (response: { access_token?: string; error?: string; expires_in?: number }) => {
        if (response.error) {
          resolve({ success: false, error: response.error });
          return;
        }

        if (response.access_token) {
          // Store the access token
          const tokens: TokenResponse = {
            access_token: response.access_token,
            expires_in: response.expires_in || 3600,
            token_type: 'Bearer',
          };
          
          await saveCalendarTokens(userId, tokens);
          resolve({ success: true });
        } else {
          resolve({ success: false, error: 'No access token received' });
        }
      },
    });

    // Request access token
    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
}

// ============================================
// Token Management
// ============================================

/**
 * Save calendar tokens to Firestore
 */
async function saveCalendarTokens(userId: string, tokens: TokenResponse): Promise<void> {
  const userRef = doc(db, 'users', userId);
  
  const updateData: Record<string, unknown> = {
    googleCalendarLinked: true,
    googleAccessToken: tokens.access_token,
    googleTokenExpiry: Timestamp.fromDate(
      new Date(Date.now() + tokens.expires_in * 1000)
    ),
  };

  // Only update refresh token if we got a new one
  if (tokens.refresh_token) {
    updateData.googleRefreshToken = tokens.refresh_token;
  }

  await updateDoc(userRef, updateData);
}

/**
 * Get valid access token, refreshing if needed
 */
async function getValidAccessToken(userId: string): Promise<string | null> {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) return null;
  
  const userData = userSnap.data() as User;
  
  if (!userData.googleCalendarLinked || !userData.googleAccessToken) {
    return null;
  }

  // Check if token is expired (with 5 min buffer)
  const expiry = userData.googleTokenExpiry?.toDate();
  const isExpired = expiry && expiry.getTime() < Date.now() + 5 * 60 * 1000;

  if (isExpired && userData.googleRefreshToken) {
    // Refresh the token
    const newToken = await refreshAccessToken(userId, userData.googleRefreshToken);
    return newToken;
  }

  return userData.googleAccessToken;
}

/**
 * Refresh access token using refresh token
 */
async function refreshAccessToken(userId: string, refreshToken: string): Promise<string | null> {
  const clientId = getClientId();
  const clientSecret = import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '';

  if (!clientSecret) {
    console.warn('Cannot refresh token without client secret');
    return null;
  }

  try {
    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      console.error('Token refresh failed');
      return null;
    }

    const tokens: TokenResponse = await response.json();
    await saveCalendarTokens(userId, tokens);
    
    return tokens.access_token;
  } catch (error) {
    console.error('Token refresh error:', error);
    return null;
  }
}

/**
 * Check if user has calendar linked
 */
export async function checkCalendarLinked(userId: string): Promise<boolean> {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) return false;
  
  const userData = userSnap.data() as User;
  return userData.googleCalendarLinked === true;
}

/**
 * Unlink Google Calendar
 */
export async function unlinkGoogleCalendar(userId: string): Promise<void> {
  const userRef = doc(db, 'users', userId);
  
  await updateDoc(userRef, {
    googleCalendarLinked: false,
    googleAccessToken: null,
    googleRefreshToken: null,
    googleTokenExpiry: null,
  });
}

// ============================================
// Calendar Event Operations
// ============================================

/**
 * Create a calendar event for a booking
 */
export async function createCalendarEvent(
  userId: string,
  booking: Booking,
  otherPartyName: string,
  isOnlineSession: boolean
): Promise<CalendarEventResult> {
  const accessToken = await getValidAccessToken(userId);
  
  if (!accessToken) {
    return { success: false, error: 'No valid access token' };
  }

  try {
    // Parse date and time
    const startDateTime = new Date(`${booking.proposedDate}T${booking.proposedTime}:00`);
    const endDateTime = new Date(startDateTime.getTime() + booking.duration * 60 * 1000);

    // Build event object
    const event: Record<string, unknown> = {
      summary: `SkillSwap: ${booking.listingTitle}`,
      description: buildEventDescription(booking, otherPartyName),
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 30 },
          { method: 'popup', minutes: 10 },
        ],
      },
    };

    // Add location if specified
    if (booking.location) {
      event.location = booking.location;
    }

    // Add Google Meet for online sessions
    if (isOnlineSession) {
      event.conferenceData = {
        createRequest: {
          requestId: `skillswap-${booking.id}-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      };
    }

    // Create the event
    const url = new URL(`${GOOGLE_CALENDAR_API}/calendars/primary/events`);
    if (isOnlineSession) {
      url.searchParams.set('conferenceDataVersion', '1');
    }

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Calendar event creation failed:', error);
      return { success: false, error: error.error?.message || 'Failed to create event' };
    }

    const createdEvent: CalendarEvent = await response.json();

    return {
      success: true,
      eventId: createdEvent.id,
      meetLink: createdEvent.hangoutLink,
    };
  } catch (error) {
    console.error('Create calendar event error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Delete a calendar event (for cancellations)
 */
export async function deleteCalendarEvent(userId: string, eventId: string): Promise<boolean> {
  const accessToken = await getValidAccessToken(userId);
  
  if (!accessToken) {
    return false;
  }

  try {
    const response = await fetch(
      `${GOOGLE_CALENDAR_API}/calendars/primary/events/${eventId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    return response.ok || response.status === 404; // 404 is OK (already deleted)
  } catch (error) {
    console.error('Delete calendar event error:', error);
    return false;
  }
}

// ============================================
// Helpers
// ============================================

function buildEventDescription(booking: Booking, otherPartyName: string): string {
  const lines = [
    `Skill Exchange Session via SkillSwap`,
    ``,
    `Session: ${booking.listingTitle}`,
    `With: ${otherPartyName}`,
    `Duration: ${formatDuration(booking.duration)}`,
  ];

  if (booking.notes) {
    lines.push(``, `Notes: ${booking.notes}`);
  }

  lines.push(
    ``,
    `---`,
    `Manage your booking at ${window.location.origin}/bookings`
  );

  return lines.join('\n');
}

function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minutes`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }
  return `${hours}h ${remainingMinutes}m`;
}

// ============================================
// Booking Integration
// ============================================

/**
 * Create calendar events for both parties when booking is confirmed
 * Returns the Meet link if one was created
 */
export async function createCalendarEventsForBooking(
  booking: Booking,
  isOnlineSession: boolean
): Promise<{ meetLink?: string; requesterEventId?: string; providerEventId?: string }> {
  const results: {
    meetLink?: string;
    requesterEventId?: string;
    providerEventId?: string;
  } = {};

  // Check which users have calendar linked
  const [requesterLinked, providerLinked] = await Promise.all([
    checkCalendarLinked(booking.requesterId),
    checkCalendarLinked(booking.providerId),
  ]);

  // Create event for requester
  if (requesterLinked) {
    const result = await createCalendarEvent(
      booking.requesterId,
      booking,
      booking.providerName,
      isOnlineSession
    );
    
    if (result.success) {
      results.requesterEventId = result.eventId;
      if (result.meetLink) {
        results.meetLink = result.meetLink;
      }
    }
  }

  // Create event for provider
  if (providerLinked) {
    const result = await createCalendarEvent(
      booking.providerId,
      booking,
      booking.requesterName,
      // If requester already created a Meet link, don't create another
      isOnlineSession && !results.meetLink
    );
    
    if (result.success) {
      results.providerEventId = result.eventId;
      if (result.meetLink && !results.meetLink) {
        results.meetLink = result.meetLink;
      }
    }
  }

  return results;
}

// ============================================
// GIS Type Declaration (for TypeScript)
// ============================================

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: {
              access_token?: string;
              error?: string;
              expires_in?: number;
            }) => void;
          }) => {
            requestAccessToken: (options?: { prompt?: string }) => void;
          };
        };
      };
    };
  }
  const google: Window['google'];
}
