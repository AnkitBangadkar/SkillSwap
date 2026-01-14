import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Send, Loader2, MessageCircle, Calendar, X } from 'lucide-react';
import { Card, Button, Avatar, EmptyState, Modal, Input, Select, Textarea } from '../components/ui';
import { ROUTES, DURATION_OPTIONS } from '../lib/constants';
import { getChat, subscribeToMessages, sendMessage, markChatAsRead } from '../services/chat';
import { createBooking } from '../services/bookings';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';
import type { Chat, Message } from '../types';

export default function ChatRoom() {
  const navigate = useNavigate();
  const { chatId } = useParams<{ chatId: string }>();
  const { user } = useAuthStore();
  const { showToast } = useUIStore();

  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // Booking modal state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingDuration, setBookingDuration] = useState('60');
  const [bookingLocation, setBookingLocation] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch chat and subscribe to messages
  useEffect(() => {
    if (!chatId || !user) return;

    let unsubscribeMessages: (() => void) | undefined;

    async function loadChat() {
      try {
        const chatData = await getChat(chatId!);
        if (chatData) {
          setChat(chatData);
          // Mark as read when opening
          await markChatAsRead(chatId!, user!.id);

          // Subscribe to messages
          unsubscribeMessages = subscribeToMessages(chatId!, (msgs) => {
            setMessages(msgs);
            setIsLoading(false);
          });
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to load chat:', error);
        setIsLoading(false);
      }
    }

    loadChat();

    return () => {
      if (unsubscribeMessages) {
        unsubscribeMessages();
      }
    };
  }, [chatId, user]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark as read when window becomes visible
  useEffect(() => {
    if (!chatId || !user) return;

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        markChatAsRead(chatId, user.id);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [chatId, user]);

  const getOtherParticipant = () => {
    if (!chat || !user) return null;
    const otherId = chat.participants.find((id) => id !== user.id);
    return otherId ? { id: otherId, ...chat.participantDetails[otherId] } : null;
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatId || !user || isSending) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setIsSending(true);

    try {
      await sendMessage(user.id, { chatId, text: messageText });
    } catch (error) {
      console.error('Failed to send message:', error);
      setNewMessage(messageText); // Restore message on error
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chat || !user || !bookingDate || !bookingTime) return;

    const other = getOtherParticipant();
    if (!other) return;

    setIsBooking(true);

    try {
      await createBooking(user.id, user.name, {
        chatId: chat.id,
        listingId: chat.listingId,
        providerId: other.id,
        proposedDate: bookingDate,
        proposedTime: bookingTime,
        duration: parseInt(bookingDuration),
        location: bookingLocation || undefined,
        notes: bookingNotes || undefined,
      });

      showToast({
        type: 'success',
        message: 'Session request sent! Waiting for confirmation.',
      });

      // Reset form and close modal
      setShowBookingModal(false);
      setBookingDate('');
      setBookingTime('');
      setBookingDuration('60');
      setBookingLocation('');
      setBookingNotes('');
    } catch (error) {
      console.error('Failed to create booking:', error);
      showToast({
        type: 'error',
        message: 'Failed to send session request. Please try again.',
      });
    } finally {
      setIsBooking(false);
    }
  };

  const formatMessageTime = (timestamp: { toDate?: () => Date }) => {
    if (!timestamp?.toDate) return '';
    return timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const other = getOtherParticipant();

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
          <button
            onClick={() => navigate(ROUTES.chats)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-semibold text-gray-900">Chat</h1>
            <p className="text-sm text-gray-500">Conversation not found</p>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Card padding="lg" className="max-w-md text-center">
            <EmptyState
              icon={<MessageCircle className="h-8 w-8" />}
              title="Conversation not found"
              description="This conversation may have been deleted or you don't have access to it"
              action={{
                label: 'Back to Messages',
                onClick: () => navigate(ROUTES.chats),
              }}
            />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 pb-4 border-b border-gray-200 flex-shrink-0">
        <button
          onClick={() => navigate(ROUTES.chats)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Avatar name={other?.name || 'Unknown'} src={other?.photoURL} size="sm" />
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold text-gray-900 truncate">{other?.name || 'Unknown User'}</h1>
          <p className="text-sm text-gray-500 truncate">{chat.listingTitle}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<Calendar className="h-4 w-4" />}
          onClick={() => setShowBookingModal(true)}
        >
          Schedule
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No messages yet</p>
            <p className="text-sm">Send a message to start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.senderId === user?.id;
            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 ${isOwn
                      ? 'bg-indigo-600 text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-900 rounded-bl-md'
                    }`}
                >
                  <p className="break-words">{message.text}</p>
                  <p
                    className={`text-xs mt-1 ${isOwn ? 'text-indigo-200' : 'text-gray-500'
                      }`}
                  >
                    {formatMessageTime(message.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSend} className="flex gap-3 pt-4 border-t border-gray-200 flex-shrink-0">
        <input
          ref={inputRef}
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          disabled={isSending}
        />
        <Button
          type="submit"
          disabled={!newMessage.trim() || isSending}
          className="px-4"
        >
          {isSending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </form>

      {/* Booking Modal */}
      <Modal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        title="Schedule a Session"
        size="md"
      >
        <form onSubmit={handleCreateBooking} className="space-y-4">
          <p className="text-sm text-gray-600">
            Request a skill exchange session with {other?.name}. They will receive a notification to confirm.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="date"
              label="Date"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              min={getMinDate()}
              required
            />
            <Input
              type="time"
              label="Time"
              value={bookingTime}
              onChange={(e) => setBookingTime(e.target.value)}
              required
            />
          </div>

          <Select
            label="Duration"
            options={DURATION_OPTIONS.map((d) => ({
              value: d.value.toString(),
              label: d.label,
            }))}
            value={bookingDuration}
            onChange={setBookingDuration}
          />

          <Input
            label="Location (optional)"
            placeholder="e.g., Library Room 3, Zoom link, etc."
            value={bookingLocation}
            onChange={(e) => setBookingLocation(e.target.value)}
          />

          <Textarea
            label="Notes (optional)"
            placeholder="Any specific topics you'd like to cover..."
            value={bookingNotes}
            onChange={(e) => setBookingNotes(e.target.value)}
            rows={3}
          />

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setShowBookingModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={!bookingDate || !bookingTime || isBooking}
            >
              {isBooking ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4 mr-2" />
                  Send Request
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
