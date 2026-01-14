import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Card, Button, EmptyState } from '../components/ui';
import { ROUTES } from '../lib/constants';

export default function Matches() {
  // For now, show empty state encouraging users to explore and create listings
  // Real matching would require AI analysis of listings to find compatible users

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Matches</h1>
        <p className="text-gray-600 mt-1">
          Discover peers with complementary skills
        </p>
      </div>

      {/* How Matching Works */}
      <Card padding="lg" className="bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">How AI Matching Works</h3>
            <p className="text-sm text-gray-600 mb-3">
              Our AI analyzes your listings and finds peers whose skills complement yours.
              If you're offering Python and someone needs Python help, you'll match!
            </p>
            <Link to={ROUTES.explore}>
              <Button size="sm">
                Explore Listings
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Empty State */}
      <EmptyState
        icon={<Sparkles className="h-8 w-8" />}
        title="No matches yet"
        description="Create more listings and explore others' posts to get AI-powered match suggestions"
        action={{
          label: 'Create a Listing',
          href: ROUTES.createListing,
        }}
      />
    </div>
  );
}
