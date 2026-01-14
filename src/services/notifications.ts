import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
  writeBatch,
  getDocs,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Notification, NotificationType } from '../types';

const USERS_COLLECTION = 'users';
const NOTIFICATIONS_COLLECTION = 'notifications';

// ============================================
// Create Notification
// ============================================

export async function createNotification(
  recipientId: string,
  type: NotificationType,
  title: string,
  message: string,
  link?: string
): Promise<string> {
  try {
    const notificationsRef = collection(db, USERS_COLLECTION, recipientId, NOTIFICATIONS_COLLECTION);
    
    const notificationData = {
      userId: recipientId,
      type,
      title,
      message,
      link,
      read: false,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(notificationsRef, notificationData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating notification:', error);
    // We don't want to block the main action if notification fails
    return '';
  }
}

// ============================================
// Subscribe to Notifications
// ============================================

export function subscribeToNotifications(
  userId: string,
  callback: (notifications: Notification[]) => void
): Unsubscribe {
  const q = query(
    collection(db, USERS_COLLECTION, userId, NOTIFICATIONS_COLLECTION),
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Notification[];
    
    callback(notifications);
  });
}

// ============================================
// Mark Notification as Read
// ============================================

export async function markNotificationAsRead(
  userId: string,
  notificationId: string
): Promise<void> {
  const docRef = doc(db, USERS_COLLECTION, userId, NOTIFICATIONS_COLLECTION, notificationId);
  await updateDoc(docRef, {
    read: true,
  });
}

// ============================================
// Mark All Notifications as Read
// ============================================

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  const q = query(
    collection(db, USERS_COLLECTION, userId, NOTIFICATIONS_COLLECTION),
    where('read', '==', false)
  );

  const snapshot = await getDocs(q);
  const batch = writeBatch(db);

  snapshot.docs.forEach((doc) => {
    batch.update(doc.ref, { read: true });
  });

  await batch.commit();
}
