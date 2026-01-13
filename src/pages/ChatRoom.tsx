import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Calendar, Sparkles, MoreVertical } from 'lucide-react';
import { Card, Button, Avatar, Badge, Input } from '../components/ui';
import { ROUTES } from '../lib/constants';
import { cn, getRelativeTime } from '../lib/utils';
import { useAuthStore } from '../stores/authStore';

// Mock data for demo
const mockChatData = {
  id: 'chat1',
  participants: ['currentUser', 'user1'],
  participantDetails: {
    user1: { name: 'Ananya Gupta', photoURL: '' },
    currentUser: { name: 'You', photoURL: '' },
  },
  listingId: 'listing1',
  listingTitle: 'React & TypeScript Help',
};

const mockMessages = [
  {
    id: 'm1',
    senderId: 'user1',
    text: 'Hi! I saw your listing for React & TypeScript tutoring. I really need help with custom hooks.',
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: 'm2',
    senderId: 'currentUser',
    text: 'Hey Ananya! I\'d be happy to help. Custom hooks are a great topic - they really unlock the power of React.',
    createdAt: new Date(Date.now() - 1000 * 60 * 25),
  },
  {
    id: 'm3',
    senderId: 'user1',
    text: 'That sounds great! I\'m specifically struggling with useCallback and useMemo - when to use which.',
    createdAt: new Date(Date.now() - 1000 * 60 * 20),
  },
  {
    id: 'm4',
    senderId: 'currentUser',
    text: 'Those are commonly confused! useMemo is for memoizing values, useCallback is for memoizing functions. I can explain with examples.',
    createdAt: new Date(Date.now() - 1000 * 60 * 15),
  },
  {
    id: 'm5',
    senderId: 'user1',
    text: 'That would be super helpful! When are you free for a session?',
    createdAt: new Date(Date.now() - 1000 * 60 * 10),
  },
  {
    id: 'm6',
    senderId: 'user1',
    text: 'Sure, I can help you with that! When are you free?',
    createdAt: new Date(Date.now() - 1000 * 60 * 5),
  },
];

// Mock AI conversation starters
const conversationStarters = [
  "What specific topics would you like to cover?",
  "How much experience do you have with this skill?",
  "Would you prefer online or in-person sessions?",
];

export default function ChatRoom() {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [showStarters, setShowStarters] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentUserId = user?.id || 'currentUser';
  const otherUser = mockChatData.participantDetails.user1;

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: `m${messages.length + 1}`,
      senderId: currentUserId,
      text: newMessage.trim(),
      createdAt: new Date(),
    };

    setMessages([...messages, message]);
    setNewMessage('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const useStarter = (starter: string) => {
    setNewMessage(starter);
    setShowStarters(false);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
        <button
          onClick={() => navigate(ROUTES.chats)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        
        <Avatar name={otherUser.name} src={otherUser.photoURL} size="md" />
        
        <div className="flex-1">
          <h2 className="font-semibold text-gray-900">{otherUser.name}</h2>
          <p className="text-sm text-gray-500">{mockChatData.listingTitle}</p>
        </div>

        <Button
          variant="outline"
          size="sm"
          leftIcon={<Calendar className="h-4 w-4" />}
        >
          Book Session
        </Button>
        
        <button className="p-2 hover:bg-gray-100 rounded-lg">
          <MoreVertical className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {/* Listing Context */}
        <div className="flex justify-center">
          <Badge variant="secondary" className="text-xs">
            Connected via: {mockChatData.listingTitle}
          </Badge>
        </div>

        {/* Message List */}
        {messages.map((message) => {
          const isOwn = message.senderId === currentUserId;
          return (
            <div
              key={message.id}
              className={cn('flex gap-2', isOwn ? 'flex-row-reverse' : 'flex-row')}
            >
              {!isOwn && (
                <Avatar name={otherUser.name} src={otherUser.photoURL} size="sm" />
              )}
              <div
                className={cn(
                  'max-w-[70%] rounded-2xl px-4 py-2',
                  isOwn
                    ? 'bg-indigo-600 text-white rounded-tr-sm'
                    : 'bg-gray-100 text-gray-900 rounded-tl-sm'
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                <p
                  className={cn(
                    'text-xs mt-1',
                    isOwn ? 'text-indigo-200' : 'text-gray-400'
                  )}
                >
                  {getRelativeTime(message.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* AI Conversation Starters */}
      {showStarters && (
        <Card padding="sm" className="mb-2 border-indigo-100 bg-indigo-50/50">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-900">Suggested messages</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {conversationStarters.map((starter, i) => (
              <button
                key={i}
                onClick={() => useStarter(starter)}
                className="text-sm px-3 py-1.5 rounded-full bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition-colors"
              >
                {starter}
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Input */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowStarters(!showStarters)}
            className={cn(
              'p-2 rounded-lg transition-colors',
              showStarters
                ? 'bg-indigo-100 text-indigo-600'
                : 'hover:bg-gray-100 text-gray-400'
            )}
            title="AI suggestions"
          >
            <Sparkles className="h-5 w-5" />
          </button>
          
          <Input
            ref={inputRef}
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="px-4"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
