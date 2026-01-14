import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, User, MessageCircle, Check, X, Loader2 } from 'lucide-react';
import { Card, Button, Badge, Avatar, EmptyState } from '../components/ui';
import { ROUTES, BOOKING_STATUS_LABELS, DURATION_OPTIONS } from '../lib/constants';
import { getUserBookings, confirmBooking, declineBooking, cancelBooking } from '../services/bookings';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';
import type { Booking, BookingStatus } from '../types';

type TabType = 'pending' | 'upcoming' | 'past';

export default function Bookings() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { showToast } = useUIStore();

  const [bookings, setBookings] = useState<(Booking & { isRequester?: boolean })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const result = await getUserBookings(user.id);
      setBookings(result);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      showToast({ type: 'error', message: 'Failed to load bookings' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async (bookingId: string) => {
    setProcessingId(bookingId);
    try {
      await confirmBooking(bookingId);
      showToast({ type: 'success', message: 'Session confirmed!' });
      fetchBookings();
    } catch (error) {
      console.error('Failed to confirm booking:', error);
      showToast({ type: 'error', message: 'Failed to confirm session' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (bookingId: string) => {
    setProcessingId(bookingId);
    try {
      await declineBooking(bookingId);
      showToast({ type: 'success', message: 'Session declined' });
      fetchBookings();
    } catch (error) {
      console.error('Failed to decline booking:', error);
      showToast({ type: 'error', message: 'Failed to decline session' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancel = async (bookingId: string) => {
    setProcessingId(bookingId);
    try {
      await cancelBooking(bookingId);
      showToast({ type: 'success', message: 'Session cancelled' });
      fetchBookings();
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      showToast({ type: 'error', message: 'Failed to cancel session' });
    } finally {
      setProcessingId(null);
    }
  };

  // Filter bookings by tab
  const filterBookings = (tab: TabType) => {
    const now = new Date();
    return bookings.filter((booking) => {
      const bookingDate = new Date(`${booking.proposedDate}T${booking.proposedTime}`);

      switch (tab) {
        case 'pending':
          return booking.status === 'pending';
        case 'upcoming':
          return booking.status === 'confirmed' && bookingDate >= now;
        case 'past':
          return booking.status === 'completed' ||
            booking.status === 'declined' ||
            booking.status === 'cancelled' ||
            (booking.status === 'confirmed' && bookingDate < now);
        default:
          return true;
      }
    });
  };

  const filteredBookings = filterBookings(activeTab);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getDurationLabel = (minutes: number) => {
    const option = DURATION_OPTIONS.find((d) => d.value === minutes);
    return option?.label || `${minutes} minutes`;
  };

  const getStatusBadge = (status: BookingStatus) => {
    const config = BOOKING_STATUS_LABELS[status];
    const variantMap: Record<string, 'success' | 'warning' | 'error' | 'primary' | 'outline'> = {
      green: 'success',
      yellow: 'warning',
      red: 'error',
      blue: 'primary',
      gray: 'outline',
    };
    return <Badge variant={variantMap[config.color] || 'outline'}>{config.label}</Badge>;
  };

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: 'pending', label: 'Pending', count: filterBookings('pending').length },
    { key: 'upcoming', label: 'Upcoming', count: filterBookings('upcoming').length },
    { key: 'past', label: 'Past', count: filterBookings('past').length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sessions</h1>
        <p className="text-gray-600 mt-1">
          Manage your scheduled skill exchange sessions
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeTab === tab.key
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === tab.key ? 'bg-indigo-200' : 'bg-gray-200'
                }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : filteredBookings.length > 0 ? (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const isProvider = booking.providerId === user?.id;
            const otherName = isProvider ? booking.requesterName : booking.providerName;
            const isProcessing = processingId === booking.id;

            return (
              <Card key={booking.id} padding="lg" className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {booking.listingTitle}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                      <User className="h-4 w-4" />
                      <span>with {otherName}</span>
                      {isProvider && (
                        <Badge variant="outline" size="sm">You're teaching</Badge>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(booking.status)}
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>{formatDate(booking.proposedDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>{formatTime(booking.proposedTime)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>{getDurationLabel(booking.duration)}</span>
                  </div>
                  {booking.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="truncate">{booking.location}</span>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {booking.notes && (
                  <p className="text-sm text-gray-600 italic">"{booking.notes}"</p>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  {booking.status === 'pending' && isProvider && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleConfirm(booking.id)}
                        disabled={isProcessing}
                        leftIcon={isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDecline(booking.id)}
                        disabled={isProcessing}
                        leftIcon={<X className="h-4 w-4" />}
                      >
                        Decline
                      </Button>
                    </>
                  )}

                  {booking.status === 'pending' && !isProvider && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCancel(booking.id)}
                      disabled={isProcessing}
                      leftIcon={isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                    >
                      Cancel Request
                    </Button>
                  )}

                  {booking.status === 'confirmed' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(ROUTES.chatRoom(booking.chatId))}
                        leftIcon={<MessageCircle className="h-4 w-4" />}
                      >
                        View Chat
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancel(booking.id)}
                        disabled={isProcessing}
                        leftIcon={isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                      >
                        Cancel Session
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<Calendar className="h-8 w-8" />}
          title={
            activeTab === 'pending'
              ? 'No pending requests'
              : activeTab === 'upcoming'
                ? 'No upcoming sessions'
                : 'No past sessions'
          }
          description={
            activeTab === 'pending'
              ? 'Session requests will appear here'
              : activeTab === 'upcoming'
                ? 'Confirmed sessions will appear here'
                : 'Completed sessions will appear here'
          }
          action={{
            label: 'Explore Skills',
            onClick: () => navigate(ROUTES.explore),
          }}
        />
      )}
    </div>
  );
}
