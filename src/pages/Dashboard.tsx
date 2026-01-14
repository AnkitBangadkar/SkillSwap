import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, Compass, Sparkles, MessageCircle, Calendar, TrendingUp, Loader2 } from 'lucide-react';
import { Card, CardContent, Button, Badge, Avatar, EmptyState } from '../components/ui';
import { useAuthStore } from '../stores/authStore';
import { ROUTES } from '../lib/constants';
import { getUserListings } from '../services/listings';
import type { Listing } from '../types';

export default function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [userListings, setUserListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user's listings from Firestore
  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      setIsLoading(true);
      try {
        const listings = await getUserListings(user.id);
        setUserListings(listings);
      } catch (error) {
        console.error('Failed to fetch listings:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [user]);

  // Calculate stats from real data
  const quickStats = [
    { label: 'Active Listings', value: userListings.filter(l => l.status === 'active').length, icon: TrendingUp },
    { label: 'Matches', value: 0, icon: Sparkles }, // Will be populated when matches are implemented
    { label: 'Messages', value: 0, icon: MessageCircle }, // Will be populated when chats are implemented
    { label: 'Sessions', value: 0, icon: Calendar }, // Will be populated when bookings are implemented
  ];

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

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            </div>
          ) : userListings.length > 0 ? (
            <div className="space-y-3">
              {userListings.slice(0, 3).map((listing) => (
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
                        <Badge
                          variant={listing.status === 'active' ? 'success' : 'default'}
                          size="sm"
                        >
                          {listing.status}
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
                onClick: () => navigate(ROUTES.createListing),
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

          <EmptyState
            icon={<Sparkles className="h-8 w-8" />}
            title="No matches yet"
            description="Create listings and explore to get AI-powered match suggestions"
            action={{
              label: 'Explore Listings',
              onClick: () => navigate(ROUTES.explore),
            }}
          />
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
