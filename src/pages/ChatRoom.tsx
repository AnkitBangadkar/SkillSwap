import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { Card, Button, EmptyState } from '../components/ui';
import { ROUTES } from '../lib/constants';

export default function ChatRoom() {
  const navigate = useNavigate();

  // For now, show empty state - this page would be populated when chats exist
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
        <button
          onClick={() => navigate(ROUTES.chats)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="font-semibold text-gray-900">Chat</h1>
          <p className="text-sm text-gray-500">No active conversation</p>
        </div>
      </div>

      {/* Empty State */}
      <div className="flex-1 flex items-center justify-center">
        <Card padding="lg" className="max-w-md text-center">
          <EmptyState
            icon={<MessageCircle className="h-8 w-8" />}
            title="No conversation selected"
            description="Start a conversation by connecting with someone on a listing"
            action={{
              label: 'Browse Listings',
              onClick: () => navigate(ROUTES.explore),
            }}
          />
        </Card>
      </div>
    </div>
  );
}
