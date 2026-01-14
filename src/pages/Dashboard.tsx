import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, Compass, Sparkles, MessageCircle, Calendar, TrendingUp, Loader2 } from 'lucide-react';
import { Card, Button, Badge, Avatar, EmptyState } from '../components/ui';
import { StaggerContainer, StaggerItem, FadeIn, SlideUp } from '../components/ui/Motion';
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
      <SlideUp className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-[var(--text-primary)]">
            Welcome back, {user?.name.split(' ')[0]}!
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">
            Here's what's happening with your skill exchanges
          </p>
        </div>
        <Link to={ROUTES.createListing}>
          <Button leftIcon={<PlusCircle className="h-4 w-4" />}>
            Create Listing
          </Button>
        </Link>
      </SlideUp>

      {/* Quick Stats */}
      <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4" delay={0.1}>
        {quickStats.map((stat) => (
          <StaggerItem key={stat.label}>
            <Card padding="md" hover>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-[var(--color-primary-100)] text-[var(--color-primary-600)] flex items-center justify-center">
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold text-[var(--text-primary)]">{stat.value}</p>
                  <p className="text-sm text-[var(--text-secondary)]">{stat.label}</p>
                </div>
              </div>
            </Card>
          </StaggerItem>
        ))}
      </StaggerContainer>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* My Listings */}
        <FadeIn delay={0.2}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-[var(--text-primary)]">My Listings</h2>
            <Link to={ROUTES.createListing} className="text-sm text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)]">
              View all
            </Link>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--color-primary-600)]" />
            </div>
          ) : userListings.length > 0 ? (
            <StaggerContainer className="space-y-3" delay={0.3}>
              {userListings.slice(0, 3).map((listing) => (
                <StaggerItem key={listing.id}>
                  <Card hover padding="md">
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
                        <h3 className="font-medium text-[var(--text-primary)]">{listing.title}</h3>
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
                </StaggerItem>
              ))}
            </StaggerContainer>
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
        </FadeIn>

        {/* Recent Matches */}
        <FadeIn delay={0.3}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-[var(--text-primary)]">Recent Matches</h2>
            <Link to={ROUTES.matches} className="text-sm text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)]">
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
        </FadeIn>
      </div>

      {/* Quick Actions */}
      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-3 gap-4" delay={0.4}>
        <StaggerItem>
          <Link to={ROUTES.explore}>
            <Card hover padding="md" className="group h-full">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Compass className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-medium text-[var(--text-primary)]">Explore Skills</h3>
                  <p className="text-sm text-[var(--text-secondary)]">Browse all listings</p>
                </div>
              </div>
            </Card>
          </Link>
        </StaggerItem>

        <StaggerItem>
          <Link to={ROUTES.matches}>
            <Card hover padding="md" className="group h-full">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-medium text-[var(--text-primary)]">View Matches</h3>
                  <p className="text-sm text-[var(--text-secondary)]">AI-powered suggestions</p>
                </div>
              </div>
            </Card>
          </Link>
        </StaggerItem>

        <StaggerItem>
          <Link to={ROUTES.chats}>
            <Card hover padding="md" className="group h-full">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-medium text-[var(--text-primary)]">Messages</h3>
                  <p className="text-sm text-[var(--text-secondary)]">Chat with peers</p>
                </div>
              </div>
            </Card>
          </Link>
        </StaggerItem>
      </StaggerContainer>
    </div>
  );
}
