import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { Card, Avatar, Badge, EmptyState } from '../components/ui';
import { ROUTES } from '../lib/constants';
import { getRelativeTime } from '../lib/utils';
import { useAuthStore } from '../stores/authStore';

interface ChatParticipant {
  name: string;
  photoURL: string;
}

interface MockChat {
  id: string;
  participants: string[];
  participantDetails: Record<string, ChatParticipant>;
  listingTitle: string;
  lastMessage: string;
  lastMessageAt: Date;
  lastMessageSenderId: string;
  unreadCount: Record<string, number>;
}

// Mock data for demo
const mockChats: MockChat[] = [
  {
    id: 'chat1',
    participants: ['currentUser', 'user1'],
    participantDetails: {
      user1: { name: 'Ananya Gupta', photoURL: '' },
    },
    listingTitle: 'React & TypeScript Help',
    lastMessage: 'Sure, I can help you with that! When are you free?',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    lastMessageSenderId: 'user1',
    unreadCount: { currentUser: 2 },
  },
  {
    id: 'chat2',
    participants: ['currentUser', 'user2'],
    participantDetails: {
      user2: { name: 'Rohit Sharma', photoURL: '' },
    },
    listingTitle: 'Python for Machine Learning',
    lastMessage: 'Thanks for the session yesterday!',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    lastMessageSenderId: 'currentUser',
    unreadCount: { currentUser: 0 },
  },
  {
    id: 'chat3',
    participants: ['currentUser', 'user3'],
    participantDetails: {
      user3: { name: 'Priya Nair', photoURL: '' },
    },
    listingTitle: 'Guitar Lessons',
    lastMessage: 'Let me know when you want to start the lessons',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    lastMessageSenderId: 'user3',
    unreadCount: { currentUser: 1 },
  },
];

export default function Chats() {
  const { user } = useAuthStore();
  const currentUserId = user?.id || 'currentUser';

  // Get other participant's details for each chat
  const getOtherParticipant = (chat: typeof mockChats[0]) => {
    const otherUserId = chat.participants.find((id) => id !== currentUserId);
    if (!otherUserId) return { name: 'Unknown', photoURL: '' };
    return chat.participantDetails[otherUserId] || { name: 'Unknown', photoURL: '' };
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600 mt-1">
          Chat with your skill exchange partners
        </p>
      </div>

      {/* Chat List */}
      {mockChats.length > 0 ? (
        <div className="space-y-2">
          {mockChats.map((chat) => {
            const otherUser = getOtherParticipant(chat);
            const unreadCount = chat.unreadCount[currentUserId] || 0;
            const isOwnMessage = chat.lastMessageSenderId === currentUserId;

            return (
              <Link key={chat.id} to={ROUTES.chatRoom(chat.id)}>
                <Card
                  hover
                  padding="md"
                  className={unreadCount > 0 ? 'bg-indigo-50/50 border-indigo-100' : ''}
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="relative">
                      <Avatar
                        name={otherUser.name}
                        src={otherUser.photoURL}
                        size="lg"
                      />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 bg-indigo-600 text-white text-xs rounded-full flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </div>

                    {/* Chat Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`font-medium truncate ${unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                          {otherUser.name}
                        </h3>
                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                          {getRelativeTime(chat.lastMessageAt)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-500 truncate mb-1">
                        {chat.listingTitle}
                      </p>
                      
                      <p className={`text-sm truncate ${unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                        {isOwnMessage && <span className="text-gray-400">You: </span>}
                        {chat.lastMessage}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<MessageCircle className="h-8 w-8" />}
          title="No conversations yet"
          description="Connect with someone from your matches to start chatting"
          action={{
            label: 'View Matches',
            onClick: () => {},
          }}
        />
      )}
    </div>
  );
}
