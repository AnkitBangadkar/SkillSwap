import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Listing, Match } from '../types';
import { calculateMatchScore } from '../lib/utils';

// ============================================
// Get Matches for User's Listings
// ============================================

export async function getMatchesForUser(userId: string): Promise<Match[]> {
  // First, get user's listings
  const userListingsQuery = query(
    collection(db, 'listings'),
    where('userId', '==', userId),
    where('status', '==', 'active')
  );
  
  const userListingsSnapshot = await getDocs(userListingsQuery);
  const userListings = userListingsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Listing[];
  
  if (userListings.length === 0) {
    return [];
  }
  
  // Collect all tags from user's listings
  const userOfferTags = new Set<string>();
  const userRequestTags = new Set<string>();
  
  userListings.forEach((listing) => {
    if (listing.type === 'offer') {
      listing.tags.forEach((tag) => userOfferTags.add(tag.toLowerCase()));
    } else {
      listing.tags.forEach((tag) => userRequestTags.add(tag.toLowerCase()));
    }
  });
  
  // Get other users' listings
  const otherListingsQuery = query(
    collection(db, 'listings'),
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc')
  );
  
  const otherListingsSnapshot = await getDocs(otherListingsQuery);
  const otherListings = otherListingsSnapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    .filter((listing) => (listing as Listing).userId !== userId) as Listing[];
  
  // Find matches: opposite type with overlapping tags
  const matches: Match[] = [];
  
  otherListings.forEach((listing) => {
    let matchScore = 0;
    
    if (listing.type === 'offer') {
      // Match with user's requests
      matchScore = calculateMatchScore(listing.tags, Array.from(userRequestTags));
    } else {
      // Match with user's offers
      matchScore = calculateMatchScore(listing.tags, Array.from(userOfferTags));
    }
    
    if (matchScore > 0) {
      matches.push({
        listing,
        matchScore,
      });
    }
  });
  
  // Sort by match score (highest first)
  matches.sort((a, b) => b.matchScore - a.matchScore);
  
  return matches;
}

// ============================================
// Get Match Suggestions for a Specific Listing
// ============================================

export async function getMatchesForListing(
  listingId: string,
  listingType: 'offer' | 'request',
  listingTags: string[],
  userId: string
): Promise<Match[]> {
  // Get opposite type listings
  const oppositeType = listingType === 'offer' ? 'request' : 'offer';
  
  const q = query(
    collection(db, 'listings'),
    where('type', '==', oppositeType),
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  const listings = querySnapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    .filter((listing) => (listing as Listing).userId !== userId) as Listing[];
  
  // Calculate match scores
  const matches: Match[] = listings.map((listing) => ({
    listing,
    matchScore: calculateMatchScore(listingTags, listing.tags),
  }));
  
  // Filter out zero scores and sort
  return matches
    .filter((match) => match.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore);
}
