import { Link } from 'react-router-dom';
import { PlusCircle, Compass, Sparkles, MessageCircle, Calendar, TrendingUp } from 'lucide-react';
import { Card, CardContent, Button, Badge, Avatar, EmptyState } from '../components/ui';
import { useAuthStore } from '../stores/authStore';
import { ROUTES } from '../lib/constants';

// Mock data for demo - will be replaced with Firestore data
const mockUserListings = [
  {
    id: '1',
    title: 'Python for Data Science',
    type: 'offer' as const,
    tags: ['Python', 'Data Science', 'Machine Learning'],
    status: 'active' as const,
  },
  {
    id: '2',
    title: 'Guitar Basics',
    type: 'request' as const,
    tags: ['Guitar', 'Music'],
    status: 'active' as const,
  },
];

const mockRecentMatches = [
  {
    id: '1',
    userName: 'Priya Sharma',
    userPhoto: '',
    listingTitle: 'React & TypeScript Help',
    matchScore: 85,
  },
  {
    id: '2',
    userName: 'Rahul Verma',
    userPhoto: '',
    listingTitle: 'Guitar Lessons',
    matchScore: 72,
  },
];

const quickStats = [
  { label: 'Active Listings', value: 2, icon: TrendingUp },
  { label: 'Matches', value: 5, icon: Sparkles },
  { label: 'Messages', value: 3, icon: MessageCircle },
  { label: 'Sessions', value: 1, icon: Calendar },
];

export default function Dashboard() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name.split(' ')[0]}!
          </h1>
          <p className="text-gray-600 mt-1">
            Here's what's happening with your skill exchanges
          </p>
        </div>
        <Link to={ROUTES.createListing}>
          <Button leftIcon={<PlusCircle className="h-4 w-4" />}>
            Create Listing
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat) => (
          <Card key={stat.label} padding="md">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* My Listings */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">My Listings</h2>
            <Link to={ROUTES.createListing} className="text-sm text-indigo-600 hover:text-indigo-700">
              View all
            </Link>
          </div>
          
          {mockUserListings.length > 0 ? (
            <div className="space-y-3">
              {mockUserListings.map((listing) => (
                <Card key={listing.id} hover padding="md">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant={listing.type === 'offer' ? 'success' : 'primary'}
                          size="sm"
                        >
                          {listing.type === 'offer' ? 'Offering' : 'Requesting'}
                        </Badge>
                      </div>
                      <h3 className="font-medium text-gray-900">{listing.title}</h3>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {listing.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" size="sm">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No listings yet"
              description="Create your first listing to start matching with peers"
              action={{
                label: 'Create Listing',
                onClick: () => {},
              }}
            />
          )}
        </div>

        {/* Recent Matches */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Matches</h2>
            <Link to={ROUTES.matches} className="text-sm text-indigo-600 hover:text-indigo-700">
              View all
            </Link>
          </div>
          
          {mockRecentMatches.length > 0 ? (
            <div className="space-y-3">
              {mockRecentMatches.map((match) => (
                <Card key={match.id} hover padding="md">
                  <div className="flex items-center gap-3">
                    <Avatar name={match.userName} src={match.userPhoto} size="md" />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{match.userName}</h3>
                      <p className="text-sm text-gray-500">{match.listingTitle}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-indigo-600">
                        <Sparkles className="h-4 w-4" />
                        <span className="font-medium">{match.matchScore}%</span>
                      </div>
                      <span className="text-xs text-gray-500">match</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Sparkles className="h-8 w-8" />}
              title="No matches yet"
              description="Create listings to start getting matched with peers"
              action={{
                label: 'Explore Listings',
                onClick: () => {},
              }}
            />
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to={ROUTES.explore}>
          <Card hover padding="md" className="group">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Compass className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Explore Skills</h3>
                <p className="text-sm text-gray-500">Browse all listings</p>
              </div>
            </div>
          </Card>
        </Link>
        
        <Link to={ROUTES.matches}>
          <Card hover padding="md" className="group">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">View Matches</h3>
                <p className="text-sm text-gray-500">AI-powered suggestions</p>
              </div>
            </div>
          </Card>
        </Link>
        
        <Link to={ROUTES.chats}>
          <Card hover padding="md" className="group">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Messages</h3>
                <p className="text-sm text-gray-500">Chat with peers</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
