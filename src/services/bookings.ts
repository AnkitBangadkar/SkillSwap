import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Booking, CreateBookingData, BookingStatus } from '../types';
import { createNotification } from './notifications';
import { createCalendarEventsForBooking, createCalendarEvent } from './calendar';

const COLLECTION_NAME = 'bookings';

// ============================================
// Create Booking
// ============================================

export async function createBooking(
  requesterId: string,
  requesterName: string,
  data: CreateBookingData
): Promise<string> {
  // Get listing info for the booking
  const listingRef = doc(db, 'listings', data.listingId);
  const listingSnap = await getDoc(listingRef);

  if (!listingSnap.exists()) {
    throw new Error('Listing not found');
  }

  const listingData = listingSnap.data();

  // Build booking data - Firestore doesn't accept undefined values
  const bookingData: Record<string, unknown> = {
    chatId: data.chatId,
    listingId: data.listingId,
    providerId: data.providerId,
    proposedDate: data.proposedDate,
    proposedTime: data.proposedTime,
    duration: data.duration,
    listingTitle: listingData.title,
    requesterId,
    requesterName,
    providerName: listingData.userName,
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  // Only add optional fields if they have values
  if (data.location) {
    bookingData.location = data.location;
  }
  if (data.notes) {
    bookingData.notes = data.notes;
  }

  const docRef = await addDoc(collection(db, COLLECTION_NAME), bookingData);

  // Notify the provider
  await createNotification(
    data.providerId,
    'booking_request',
    'New Session Request',
    `${requesterName} requested a session for "${listingData.title}"`,
    '/bookings'
  );

  return docRef.id;
}


// ============================================
// Get Booking by ID
// ============================================

export async function getBooking(bookingId: string): Promise<Booking | null> {
  const docRef = doc(db, COLLECTION_NAME, bookingId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;

  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as Booking;
}

// ============================================
// Get User's Bookings (as requester or provider)
// ============================================

export async function getUserBookings(userId: string): Promise<Booking[]> {
  // Query for bookings where user is requester
  const requesterQuery = query(
    collection(db, COLLECTION_NAME),
    where('requesterId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  // Query for bookings where user is provider
  const providerQuery = query(
    collection(db, COLLECTION_NAME),
    where('providerId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const [requesterSnapshot, providerSnapshot] = await Promise.all([
    getDocs(requesterQuery),
    getDocs(providerQuery),
  ]);

  const requesterBookings = requesterSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    isRequester: true,
  })) as (Booking & { isRequester: boolean })[];

  const providerBookings = providerSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    isRequester: false,
  })) as (Booking & { isRequester: boolean })[];

  // Combine and sort by createdAt
  const allBookings = [...requesterBookings, ...providerBookings];
  allBookings.sort((a, b) => {
    const aTime = a.createdAt?.toMillis?.() || 0;
    const bTime = b.createdAt?.toMillis?.() || 0;
    return bTime - aTime;
  });

  return allBookings;
}

// ============================================
// Update Booking Status
// ============================================

export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus
): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, bookingId);
  await updateDoc(docRef, {
    status,
    updatedAt: serverTimestamp(),
  });
}

// ============================================
// Helper to get booking details for notifications
// ============================================
async function getBookingDetails(bookingId: string): Promise<(Booking & { id: string }) | null> {
  const docRef = doc(db, COLLECTION_NAME, bookingId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as Booking & { id: string };
}

// ============================================
// Helper to get listing mode for calendar
// ============================================
async function getListingMode(listingId: string): Promise<'online' | 'offline' | 'both' | null> {
  const listingRef = doc(db, 'listings', listingId);
  const listingSnap = await getDoc(listingRef);
  if (!listingSnap.exists()) return null;
  return listingSnap.data().mode as 'online' | 'offline' | 'both';
}

// ============================================
// Confirm Booking
// ============================================

export interface ConfirmBookingResult {
  success: boolean;
  calendarEventsCreated: boolean;
  meetLink?: string;
}

export async function confirmBooking(bookingId: string): Promise<ConfirmBookingResult> {
  await updateBookingStatus(bookingId, 'confirmed');
  
  const booking = await getBookingDetails(bookingId);
  if (!booking) {
    return { success: true, calendarEventsCreated: false };
  }

  // Send notification
  await createNotification(
    booking.requesterId,
    'booking_confirmed',
    'Session Confirmed!',
    `${booking.providerName} confirmed your session for "${booking.listingTitle}"`,
    '/bookings'
  );

  // Create calendar events for both parties
  let calendarEventsCreated = false;
  let meetLink: string | undefined;

  try {
    // Determine if session is online (for Google Meet link)
    const listingMode = await getListingMode(booking.listingId);
    const isOnlineSession = listingMode === 'online' || listingMode === 'both';

    const calendarResult = await createCalendarEventsForBooking(
      booking,
      isOnlineSession
    );

    // Store calendar event IDs and Meet link in the booking
    const bookingUpdates: Record<string, unknown> = {
      updatedAt: serverTimestamp(),
    };

    if (calendarResult.requesterEventId) {
      bookingUpdates.requesterCalendarEventId = calendarResult.requesterEventId;
      calendarEventsCreated = true;
    }

    if (calendarResult.providerEventId) {
      bookingUpdates.providerCalendarEventId = calendarResult.providerEventId;
      calendarEventsCreated = true;
    }

    if (calendarResult.meetLink) {
      bookingUpdates.meetLink = calendarResult.meetLink;
      meetLink = calendarResult.meetLink;
    }

    // Update booking with calendar info
    if (Object.keys(bookingUpdates).length > 1) {
      const bookingRef = doc(db, COLLECTION_NAME, bookingId);
      await updateDoc(bookingRef, bookingUpdates);
    }
  } catch (error) {
    // Don't fail the booking confirmation if calendar fails
    console.error('Calendar event creation failed:', error);
  }

  return { success: true, calendarEventsCreated, meetLink };
}

// ============================================
// Decline Booking
// ============================================

export async function declineBooking(bookingId: string): Promise<void> {
  await updateBookingStatus(bookingId, 'declined');

  const booking = await getBookingDetails(bookingId);
  if (booking) {
    await createNotification(
      booking.requesterId,
      'booking_declined',
      'Session Declined',
      `${booking.providerName} declined your session request`,
      '/bookings'
    );
  }
}

// ============================================
// Cancel Booking
// ============================================

export async function cancelBooking(bookingId: string): Promise<void> {
  await updateBookingStatus(bookingId, 'cancelled');
}

// ============================================
// Complete Booking
// ============================================

export async function completeBooking(bookingId: string): Promise<void> {
  await updateBookingStatus(bookingId, 'completed');
}

// ============================================
// Get Pending Bookings for Provider
// ============================================

export async function getPendingBookings(providerId: string): Promise<Booking[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('providerId', '==', providerId),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Booking[];
}

// ============================================
// Sync Booking to Calendar (Retroactive)
// ============================================

export interface SyncCalendarResult {
  success: boolean;
  eventId?: string;
  meetLink?: string;
  error?: string;
}

export async function syncBookingToCalendar(
  bookingId: string,
  userId: string
): Promise<SyncCalendarResult> {
  const booking = await getBookingDetails(bookingId);
  if (!booking) return { success: false, error: 'Booking not found' };

  const listingMode = await getListingMode(booking.listingId);
  const isOnlineSession = listingMode === 'online' || listingMode === 'both';

  const isRequester = booking.requesterId === userId;
  const otherPartyName = isRequester ? booking.providerName : booking.requesterName;

  try {
    const result = await createCalendarEvent(
      userId,
      booking,
      otherPartyName,
      isOnlineSession
    );

    if (result.success && result.eventId) {
       // Update booking with the new event ID
       const bookingRef = doc(db, COLLECTION_NAME, bookingId);
       const updates: Record<string, unknown> = {
         updatedAt: serverTimestamp()
       };

       if (isRequester) {
         updates.requesterCalendarEventId = result.eventId;
       } else {
         updates.providerCalendarEventId = result.eventId;
       }

       if (result.meetLink && !booking.meetLink) {
         updates.meetLink = result.meetLink;
       }

       await updateDoc(bookingRef, updates);
       return { success: true, eventId: result.eventId, meetLink: result.meetLink };
    }

    return { success: false, error: result.error };
  } catch (error) {
    console.error('Sync error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
