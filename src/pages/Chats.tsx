import { Link } from 'react-router-dom';
import { MessageCircle, ArrowRight } from 'lucide-react';
import { Card, Button, EmptyState } from '../components/ui';
import { ROUTES } from '../lib/constants';

export default function Chats() {
  // For now, show empty state - chats would be created when users connect on listings

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
            <Link to={ROUTES.explore}>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                Browse Listings
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Empty State */}
      <EmptyState
        icon={<MessageCircle className="h-8 w-8" />}
        title="No conversations yet"
        description="Find interesting listings and connect with peers to start chatting"
        action={{
          label: 'Explore Skills',
          href: ROUTES.explore,
        }}
      />
    </div>
  );
}
