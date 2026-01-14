import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, ArrowRight, Loader2 } from 'lucide-react';
import { Card, Button, EmptyState, Avatar, Badge } from '../components/ui';
import { ROUTES } from '../lib/constants';
import { subscribeToChats } from '../services/chat';
import { useAuthStore } from '../stores/authStore';
import type { Chat } from '../types';

export default function Chats() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToChats(user.id, (updatedChats) => {
      setChats(updatedChats);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const getOtherParticipant = (chat: Chat) => {
    if (!user) return null;
    const otherId = chat.participants.find((id) => id !== user.id);
    return otherId ? chat.participantDetails[otherId] : null;
  };

  const formatTime = (timestamp: { toDate?: () => Date }) => {
    if (!timestamp?.toDate) return '';
    const date = timestamp.toDate();
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    // Less than 24 hours - show time
    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    // Less than 7 days - show day name
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    // Otherwise show date
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600 mt-1">
          Chat with peers about skill exchanges
        </p>
      </div>

      {/* How Chats Work */}
      {chats.length === 0 && !isLoading && (
        <Card padding="lg" className="bg-gradient-to-r from-green-50 to-cyan-50">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Start Conversations</h3>
              <p className="text-sm text-gray-600 mb-3">
                When you find a listing that interests you, click "Connect" to start a chat.
                Discuss schedules, topics, and arrange your skill exchange sessions.
              </p>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => navigate(ROUTES.explore)}
              >
                Browse Listings
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : chats.length > 0 ? (
        <div className="space-y-2">
          {chats.map((chat) => {
            const other = getOtherParticipant(chat);
            const unread = user ? chat.unreadCount?.[user.id] || 0 : 0;

            return (
              <Card
                key={chat.id}
                hover
                padding="md"
                className="cursor-pointer"
                onClick={() => navigate(ROUTES.chatRoom(chat.id))}
              >
                <div className="flex items-center gap-4">
                  <Avatar
                    name={other?.name || 'Unknown'}
                    src={other?.photoURL}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {other?.name || 'Unknown User'}
                      </h3>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {formatTime(chat.lastMessageAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {chat.listingTitle}
                    </p>
                    <p className={`text-sm truncate ${unread > 0 ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                      {chat.lastMessage || 'No messages yet'}
                    </p>
                  </div>
                  {unread > 0 && (
                    <Badge variant="primary" size="sm" className="rounded-full">
                      {unread}
                    </Badge>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<MessageCircle className="h-8 w-8" />}
          title="No conversations yet"
          description="Find interesting listings and connect with peers to start chatting"
          action={{
            label: 'Explore Skills',
            onClick: () => navigate(ROUTES.explore),
          }}
        />
      )}
    </div>
  );
}
