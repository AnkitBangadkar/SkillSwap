import { useState } from 'react';
import { Calendar, Clock, MapPin, Check, X, MessageCircle } from 'lucide-react';
import { Card, Button, Badge, Avatar, EmptyState, Modal, ModalFooter } from '../components/ui';
import { BOOKING_STATUS_LABELS } from '../lib/constants';
import { formatDate, formatTime } from '../lib/utils';
import type { BookingStatus } from '../types';

// Mock data for demo
const mockBookings = [
  {
    id: 'booking1',
    listingTitle: 'React & TypeScript Help',
    requesterName: 'Ananya Gupta',
    requesterPhoto: '',
    providerName: 'You',
    proposedDate: '2025-01-15',
    proposedTime: '14:00',
    duration: 60,
    location: 'Online (Google Meet)',
    status: 'pending' as BookingStatus,
    isRequester: false,
  },
  {
    id: 'booking2',
    listingTitle: 'Python for Machine Learning',
    requesterName: 'You',
    requesterPhoto: '',
    providerName: 'Rohit Sharma',
    proposedDate: '2025-01-16',
    proposedTime: '10:00',
    duration: 90,
    location: 'Library - Study Room 3',
    status: 'confirmed' as BookingStatus,
    isRequester: true,
  },
  {
    id: 'booking3',
    listingTitle: 'Guitar Lessons',
    requesterName: 'You',
    requesterPhoto: '',
    providerName: 'Priya Nair',
    proposedDate: '2025-01-10',
    proposedTime: '16:00',
    duration: 60,
    location: 'Music Room',
    status: 'completed' as BookingStatus,
    isRequester: true,
  },
];

export default function Bookings() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'upcoming' | 'past'>('all');
  const [selectedBooking, setSelectedBooking] = useState<typeof mockBookings[0] | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'confirm' | 'decline' | null>(null);

  const now = new Date();
  
  const filteredBookings = mockBookings.filter((booking) => {
    const bookingDate = new Date(booking.proposedDate);
    
    switch (filter) {
      case 'pending':
        return booking.status === 'pending';
      case 'upcoming':
        return (booking.status === 'confirmed' || booking.status === 'pending') && bookingDate >= now;
      case 'past':
        return booking.status === 'completed' || bookingDate < now;
      default:
        return true;
    }
  });

  const handleAction = (booking: typeof mockBookings[0], action: 'confirm' | 'decline') => {
    setSelectedBooking(booking);
    setConfirmAction(action);
    setShowConfirmModal(true);
  };

  const executeAction = () => {
    // TODO: Implement actual booking status update
    console.log(`${confirmAction} booking:`, selectedBooking?.id);
    setShowConfirmModal(false);
    setSelectedBooking(null);
    setConfirmAction(null);
  };

  const getStatusBadge = (status: BookingStatus) => {
    const config = BOOKING_STATUS_LABELS[status];
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'primary' | 'default'> = {
      green: 'success',
      yellow: 'warning',
      red: 'danger',
      blue: 'primary',
      gray: 'default',
    };
    return (
      <Badge variant={variants[config.color] || 'default'} size="sm">
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
        <p className="text-gray-600 mt-1">
          Manage your skill exchange sessions
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'pending', 'upcoming', 'past'] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </div>

      {/* Bookings List */}
      {filteredBookings.length > 0 ? (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <Card key={booking.id} padding="lg">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                {/* Avatar */}
                <Avatar
                  name={booking.isRequester ? booking.providerName : booking.requesterName}
                  size="lg"
                />

                {/* Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {booking.listingTitle}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {booking.isRequester ? (
                          <>Session with <span className="font-medium">{booking.providerName}</span></>
                        ) : (
                          <>Requested by <span className="font-medium">{booking.requesterName}</span></>
                        )}
                      </p>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>

                  {/* Time & Location */}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-3">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      {formatDate(booking.proposedDate)}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      {formatTime(booking.proposedTime)} ({booking.duration} min)
                    </div>
                    {booking.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        {booking.location}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 sm:flex-col">
                  {booking.status === 'pending' && !booking.isRequester && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleAction(booking, 'confirm')}
                        leftIcon={<Check className="h-4 w-4" />}
                      >
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAction(booking, 'decline')}
                        leftIcon={<X className="h-4 w-4" />}
                      >
                        Decline
                      </Button>
                    </>
                  )}
                  {booking.status === 'confirmed' && (
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<MessageCircle className="h-4 w-4" />}
                    >
                      Message
                    </Button>
                  )}
                  {booking.status === 'pending' && booking.isRequester && (
                    <Badge variant="warning">Awaiting response</Badge>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Calendar className="h-8 w-8" />}
          title="No bookings found"
          description={
            filter === 'all'
              ? 'Book a session with someone from your matches'
              : `No ${filter} bookings to show`
          }
          action={{
            label: 'View Matches',
            onClick: () => {},
          }}
        />
      )}

      {/* Confirm/Decline Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title={confirmAction === 'confirm' ? 'Confirm Booking' : 'Decline Booking'}
      >
        <p className="text-gray-600">
          {confirmAction === 'confirm'
            ? 'Are you sure you want to confirm this session? The requester will be notified.'
            : 'Are you sure you want to decline this session request?'}
        </p>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
            Cancel
          </Button>
          <Button
            variant={confirmAction === 'confirm' ? 'primary' : 'danger'}
            onClick={executeAction}
          >
            {confirmAction === 'confirm' ? 'Confirm' : 'Decline'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
