import { Timestamp } from 'firebase/firestore';

// ============================================
// User Types
// ============================================

export interface User {
  id: string;
  name: string;
  email: string;
  photoURL: string;
  createdAt: Timestamp;
  // College email verification
  collegeEmail?: string;
  isCollegeVerified: boolean;
  verificationCode?: string;
  verificationExpiry?: Timestamp;
  // Google Calendar integration
  googleCalendarLinked?: boolean;
  googleAccessToken?: string;
  googleRefreshToken?: string;
  googleTokenExpiry?: Timestamp;
  // Preferences
  emailNotifications?: boolean;
  privacySettings?: 'public' | 'users_only';
}

export interface UserProfile extends User {
  listingsCount?: number;
  rating?: number;
  totalSessions?: number;
}

// ============================================
// Listing Types
// ============================================

export type ListingType = 'offer' | 'request';
export type ListingMode = 'online' | 'offline' | 'both';
export type ListingStatus = 'active' | 'paused' | 'completed';

export interface Listing {
  id: string;
  userId: string;
  userName: string;
  userPhoto: string;
  title: string;
  description: string;
  type: ListingType;
  tags: string[];
  availability: string;
  mode: ListingMode;
  status: ListingStatus;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface CreateListingData {
  title: string;
  description: string;
  type: ListingType;
  tags: string[];
  availability: string;
  mode: ListingMode;
}

// ============================================
// Matching Types
// ============================================

export interface Match {
  listing: Listing;
  matchScore: number; // 0-100 based on tag overlap
  explanation?: string; // Gemini-generated explanation
}

// ============================================
// Chat Types
// ============================================

export interface Chat {
  id: string;
  participants: string[]; // [userId1, userId2]
  participantDetails: Record<string, { name: string; photoURL: string }>;
  listingId: string;
  listingTitle: string;
  lastMessage: string;
  lastMessageAt: Timestamp;
  lastMessageSenderId: string;
  unreadCount: Record<string, number>; // { [userId]: count }
  createdAt: Timestamp;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  createdAt: Timestamp;
}

export interface SendMessageData {
  chatId: string;
  text: string;
}

// ============================================
// Booking Types
// ============================================

export type BookingStatus = 'pending' | 'confirmed' | 'declined' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  chatId: string;
  listingId: string;
  listingTitle: string;
  requesterId: string;
  requesterName: string;
  providerId: string;
  providerName: string;
  proposedDate: string; // ISO date string
  proposedTime: string; // HH:MM format
  duration: number; // minutes
  location?: string;
  notes?: string;
  status: BookingStatus;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  // Google Calendar integration
  requesterCalendarEventId?: string;
  providerCalendarEventId?: string;
  meetLink?: string;
}

export interface CreateBookingData {
  chatId: string;
  listingId: string;
  providerId: string;
  proposedDate: string;
  proposedTime: string;
  duration: number;
  location?: string;
  notes?: string;
}

// ============================================
// Notification Types
// ============================================

export type NotificationType =
  | 'new_match'
  | 'new_message'
  | 'booking_request'
  | 'booking_confirmed'
  | 'booking_declined';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: Timestamp;
}

// ============================================
// UI State Types
// ============================================

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  notifications: Notification[];
  unreadCount: number;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  hasMore: boolean;
  lastDoc?: unknown;
}

// ============================================
// Filter Types
// ============================================

export interface ListingFilters {
  type?: ListingType;
  mode?: ListingMode;
  tags?: string[];
  searchQuery?: string;
}
