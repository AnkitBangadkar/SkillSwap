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
  
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...data,
    listingTitle: listingData.title,
    requesterId,
    requesterName,
    providerName: listingData.userName,
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  
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
// Confirm Booking
// ============================================

export async function confirmBooking(bookingId: string): Promise<void> {
  await updateBookingStatus(bookingId, 'confirmed');
}

// ============================================
// Decline Booking
// ============================================

export async function declineBooking(bookingId: string): Promise<void> {
  await updateBookingStatus(bookingId, 'declined');
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
