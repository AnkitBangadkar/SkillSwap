import { Link } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';
import { Card, Button, EmptyState } from '../components/ui';
import { ROUTES } from '../lib/constants';

export default function Bookings() {
  // For now, show empty state - bookings would be created after chat discussions

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sessions</h1>
        <p className="text-gray-600 mt-1">
          Manage your scheduled skill exchange sessions
        </p>
      </div>

      {/* How Bookings Work */}
      <Card padding="lg" className="bg-gradient-to-r from-orange-50 to-amber-50">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Schedule Sessions</h3>
            <p className="text-sm text-gray-600 mb-3">
              After connecting with someone, you can schedule skill exchange sessions.
              Both parties confirm the time and topic, then meet up to learn!
            </p>
            <Link to={ROUTES.chats}>
              <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                View Chats
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Empty State */}
      <EmptyState
        icon={<Calendar className="h-8 w-8" />}
        title="No sessions scheduled"
        description="Connect with peers and schedule sessions to start learning"
        action={{
          label: 'Start Exploring',
          href: ROUTES.explore,
        }}
      />
    </div>
  );
}
