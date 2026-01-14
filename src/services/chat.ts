import {
  collection,
  doc,
  setDoc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
  updateDoc,
  increment,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Chat, Message, SendMessageData } from '../types';

const CHATS_COLLECTION = 'chats';
const MESSAGES_SUBCOLLECTION = 'messages';

// ============================================
// Create Chat Room
// ============================================

export async function createChat(
  listingId: string,
  listingTitle: string,
  user1Id: string,
  user1Name: string,
  user1Photo: string,
  user2Id: string,
  user2Name: string,
  user2Photo: string
): Promise<string> {
  // Generate a deterministic chat ID to prevent duplicates and avoid complex queries
  // Format: listingId_participant1_participant2 (participants sorted alphabetically)
  const sortedParticipants = [user1Id, user2Id].sort();
  const chatId = `${listingId}_${sortedParticipants[0]}_${sortedParticipants[1]}`;
  
  const chatDocRef = doc(db, CHATS_COLLECTION, chatId);
  const chatDocSnap = await getDoc(chatDocRef);
  
  if (chatDocSnap.exists()) {
    return chatId;
  }
  
  // Create new chat document
  await setDoc(chatDocRef, {
    participants: [user1Id, user2Id],
    participantDetails: {
      [user1Id]: { name: user1Name, photoURL: user1Photo },
      [user2Id]: { name: user2Name, photoURL: user2Photo },
    },
    listingId,
    listingTitle,
    lastMessage: '',
    lastMessageAt: serverTimestamp(),
    lastMessageSenderId: '',
    unreadCount: {
      [user1Id]: 0,
      [user2Id]: 0,
    },
    createdAt: serverTimestamp(),
  });
  
  return chatId;
}

// ============================================
// Find Existing Chat (Deprecated - kept for reference but unused by createChat)
// ============================================

// async function findExistingChat(
//   user1Id: string,
//   user2Id: string,
//   listingId: string
// ): Promise<string | null> {
//   return null;
// }

// ============================================
// Get User's Chats
// ============================================

export async function getUserChats(userId: string): Promise<Chat[]> {
  const q = query(
    collection(db, CHATS_COLLECTION),
    where('participants', 'array-contains', userId),
    orderBy('lastMessageAt', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Chat[];
}

// ============================================
// Get Chat by ID
// ============================================

export async function getChat(chatId: string): Promise<Chat | null> {
  const docRef = doc(db, CHATS_COLLECTION, chatId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) return null;
  
  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as Chat;
}

// ============================================
// Send Message
// ============================================

export async function sendMessage(
  userId: string,
  { chatId, text }: SendMessageData
): Promise<string> {
  // Add message to subcollection
  const messagesRef = collection(db, CHATS_COLLECTION, chatId, MESSAGES_SUBCOLLECTION);
  const messageDoc = await addDoc(messagesRef, {
    senderId: userId,
    text,
    createdAt: serverTimestamp(),
  });
  
  // Update chat with last message info
  const chatRef = doc(db, CHATS_COLLECTION, chatId);
  const chatSnap = await getDoc(chatRef);
  
  if (chatSnap.exists()) {
    const chatData = chatSnap.data();
    const otherUserId = chatData.participants.find((id: string) => id !== userId);
    
    await updateDoc(chatRef, {
      lastMessage: text,
      lastMessageAt: serverTimestamp(),
      lastMessageSenderId: userId,
      [`unreadCount.${otherUserId}`]: increment(1),
    });
  }
  
  return messageDoc.id;
}

// ============================================
// Get Messages
// ============================================

export async function getMessages(
  chatId: string,
  messageLimit = 50
): Promise<Message[]> {
  const q = query(
    collection(db, CHATS_COLLECTION, chatId, MESSAGES_SUBCOLLECTION),
    orderBy('createdAt', 'desc'),
    limit(messageLimit)
  );
  
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs
    .map((doc) => ({
      id: doc.id,
      chatId,
      ...doc.data(),
    }) as Message)
    .reverse(); // Reverse to get chronological order
}

// ============================================
// Subscribe to Messages (Real-time)
// ============================================

export function subscribeToMessages(
  chatId: string,
  callback: (messages: Message[]) => void
): Unsubscribe {
  const q = query(
    collection(db, CHATS_COLLECTION, chatId, MESSAGES_SUBCOLLECTION),
    orderBy('createdAt', 'asc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      chatId,
      ...doc.data(),
    })) as Message[];
    
    callback(messages);
  });
}

// ============================================
// Mark Chat as Read
// ============================================

export async function markChatAsRead(
  chatId: string,
  userId: string
): Promise<void> {
  const chatRef = doc(db, CHATS_COLLECTION, chatId);
  await updateDoc(chatRef, {
    [`unreadCount.${userId}`]: 0,
  });
}

// ============================================
// Subscribe to Chats (Real-time)
// ============================================

export function subscribeToChats(
  userId: string,
  callback: (chats: Chat[]) => void
): Unsubscribe {
  const q = query(
    collection(db, CHATS_COLLECTION),
    where('participants', 'array-contains', userId),
    orderBy('lastMessageAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const chats = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Chat[];
    
    callback(chats);
  });
}
