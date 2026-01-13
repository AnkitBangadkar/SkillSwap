import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  type DocumentSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Listing, CreateListingData, ListingFilters, PaginatedResponse } from '../types';

const COLLECTION_NAME = 'listings';
const PAGE_SIZE = 20;

// ============================================
// Create Listing
// ============================================

export async function createListing(
  userId: string,
  userName: string,
  userPhoto: string,
  data: CreateListingData
): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...data,
    userId,
    userName,
    userPhoto,
    status: 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  
  return docRef.id;
}

// ============================================
// Get Listing by ID
// ============================================

export async function getListing(listingId: string): Promise<Listing | null> {
  const docRef = doc(db, COLLECTION_NAME, listingId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) return null;
  
  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as Listing;
}

// ============================================
// Get User's Listings
// ============================================

export async function getUserListings(userId: string): Promise<Listing[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Listing[];
}

// ============================================
// Get All Listings (with filters & pagination)
// ============================================

export async function getListings(
  filters?: ListingFilters,
  lastDoc?: DocumentSnapshot
): Promise<PaginatedResponse<Listing>> {
  let q = query(
    collection(db, COLLECTION_NAME),
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc'),
    limit(PAGE_SIZE + 1) // Fetch one extra to check if there are more
  );
  
  // Apply filters
  if (filters?.type) {
    q = query(q, where('type', '==', filters.type));
  }
  if (filters?.mode) {
    q = query(q, where('mode', 'in', [filters.mode, 'both']));
  }
  
  // Pagination
  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }
  
  const querySnapshot = await getDocs(q);
  const docs = querySnapshot.docs;
  const hasMore = docs.length > PAGE_SIZE;
  
  // Remove the extra doc if we fetched it
  const items = (hasMore ? docs.slice(0, PAGE_SIZE) : docs).map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Listing[];
  
  // Client-side filtering for tags (Firestore doesn't support array-contains-any with other where clauses well)
  let filteredItems = items;
  if (filters?.tags && filters.tags.length > 0) {
    const lowerTags = filters.tags.map((t) => t.toLowerCase());
    filteredItems = items.filter((item) =>
      item.tags.some((tag) => lowerTags.includes(tag.toLowerCase()))
    );
  }
  
  // Client-side search filtering
  if (filters?.searchQuery) {
    const searchLower = filters.searchQuery.toLowerCase();
    filteredItems = filteredItems.filter(
      (item) =>
        item.title.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower) ||
        item.tags.some((tag) => tag.toLowerCase().includes(searchLower))
    );
  }
  
  return {
    items: filteredItems,
    hasMore,
    lastDoc: hasMore ? docs[PAGE_SIZE - 1] : undefined,
  };
}

// ============================================
// Update Listing
// ============================================

export async function updateListing(
  listingId: string,
  data: Partial<CreateListingData>
): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, listingId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

// ============================================
// Delete Listing
// ============================================

export async function deleteListing(listingId: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, listingId);
  await deleteDoc(docRef);
}

// ============================================
// Toggle Listing Status
// ============================================

export async function toggleListingStatus(
  listingId: string,
  status: 'active' | 'paused'
): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, listingId);
  await updateDoc(docRef, {
    status,
    updatedAt: serverTimestamp(),
  });
}
