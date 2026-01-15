import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, X, Loader2, MessageCircle, Clock, MapPin } from 'lucide-react';
import { Input, Button, Badge, Card, Avatar, EmptyState, Select, Modal } from '../components/ui';
import { StaggerContainer, StaggerItem, FadeIn } from '../components/ui/Motion';
import { SKILL_CATEGORIES, MODE_OPTIONS, ROUTES } from '../lib/constants';
import { getListings } from '../services/listings';
import { createChat } from '../services/chat';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';
import type { Listing } from '../types';

export default function Explore() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { showToast } = useUIStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [modeFilter, setModeFilter] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  // Fetch listings from Firestore
  useEffect(() => {
    async function fetchListings() {
      setIsLoading(true);
      try {
        const result = await getListings();
        // Filter out user's own listings
        const otherListings = result.items.filter(l => l.userId !== user?.id);
        setListings(otherListings);
      } catch (error) {
        console.error('Failed to fetch listings:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchListings();
  }, [user]);

  // Filter listings client-side
  const filteredListings = listings.filter((listing) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        listing.title.toLowerCase().includes(query) ||
        listing.description.toLowerCase().includes(query) ||
        listing.tags.some((tag) => tag.toLowerCase().includes(query));
      if (!matchesSearch) return false;
    }
    if (typeFilter && listing.type !== typeFilter) return false;
    if (modeFilter && listing.mode !== modeFilter && listing.mode !== 'both') return false;
    if (selectedTags.length > 0) {
      const hasMatchingTag = selectedTags.some((tag) =>
        listing.tags.map((t) => t.toLowerCase()).includes(tag.toLowerCase())
      );
      if (!hasMatchingTag) return false;
    }
    return true;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setTypeFilter('');
    setModeFilter('');
    setSelectedTags([]);
  };

  const handleConnect = async (listing: Listing) => {
    if (!user) return;

    try {
      const chatId = await createChat(
        listing.id,
        listing.title,
        user.id,
        user.name,
        user.photoURL,
        listing.userId,
        listing.userName,
        listing.userPhoto
      );

      showToast({
        type: 'success',
        message: `Connected with ${listing.userName}!`,
      });
      
      setSelectedListing(null);
      navigate(ROUTES.chatRoom(chatId));
    } catch (error) {
      console.error('Failed to connect:', error);
      showToast({
        type: 'error',
        message: 'Failed to start conversation. Please try again.',
      });
    }
  };

  const hasActiveFilters = searchQuery || typeFilter || modeFilter || selectedTags.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <FadeIn>
        <h1 className="text-2xl font-display font-bold text-[var(--text-primary)]">Explore Skills</h1>
        <p className="text-[var(--text-secondary)] mt-1">
          Discover skills offered and requested by your peers
        </p>
      </FadeIn>

      {/* Search & Filters */}
      <FadeIn delay={0.1} className="space-y-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search skills, topics, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
          <Button
            variant={showFilters ? 'primary' : 'outline'}
            onClick={() => setShowFilters(!showFilters)}
            leftIcon={<Filter className="h-4 w-4" />}
          >
            Filters
            {hasActiveFilters && (
              <span className="ml-1 h-5 w-5 rounded-full bg-[var(--color-primary-100)] text-[var(--color-primary-700)] text-xs flex items-center justify-center">
                !
              </span>
            )}
          </Button>
        </div>

        {showFilters && (
          <Card padding="md" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Select
                label="Type"
                options={[
                  { value: 'offer', label: 'Offering Skills' },
                  { value: 'request', label: 'Requesting Skills' },
                ]}
                value={typeFilter}
                onChange={setTypeFilter}
                placeholder="All types"
              />
              <Select
                label="Mode"
                options={MODE_OPTIONS.map((m) => ({ value: m.value, label: m.label }))}
                value={modeFilter}
                onChange={setModeFilter}
                placeholder="All modes"
              />
            </div>

            <div>
              <p className="text-sm font-medium text-[var(--text-primary)] mb-2">Quick Filters</p>
              <div className="flex flex-wrap gap-2">
                {SKILL_CATEGORIES.slice(0, 4).map((cat) => (
                  <Badge
                    key={cat.name}
                    variant={selectedTags.includes(cat.tags[0]) ? 'primary' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => {
                      if (selectedTags.includes(cat.tags[0])) {
                        setSelectedTags(selectedTags.filter((t) => t !== cat.tags[0]));
                      } else {
                        setSelectedTags([...selectedTags, cat.tags[0]]);
                      }
                    }}
                  >
                    {cat.name}
                  </Badge>
                ))}
              </div>
            </div>

            {hasActiveFilters && (
              <div className="flex justify-end">
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear Filters
                </Button>
              </div>
            )}
          </Card>
        )}
      </FadeIn>

      {/* Results Count */}
      <FadeIn delay={0.2}>
        <p className="text-sm text-[var(--text-tertiary)]">
          Showing {filteredListings.length} of {listings.length} listings
        </p>
      </FadeIn>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary-600)]" />
        </div>
      ) : filteredListings.length > 0 ? (
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" delay={0.2}>
          {filteredListings.map((listing) => (
            <StaggerItem key={listing.id}>
              <Card hover padding="md" className="flex flex-col h-full">
                {/* User Info */}
                <div className="flex items-center gap-3 mb-3">
                  <Avatar name={listing.userName} src={listing.userPhoto} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--text-primary)] truncate">{listing.userName}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{listing.availability}</p>
                  </div>
                  <Badge
                    variant={listing.type === 'offer' ? 'success' : 'primary'}
                    size="sm"
                  >
                    {listing.type === 'offer' ? 'Offers' : 'Needs'}
                  </Badge>
                </div>

                {/* Listing Content */}
                <h3 className="font-semibold text-[var(--text-primary)] mb-2">{listing.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-3 flex-1">
                  {listing.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {listing.tags.map((tag) => (
                    <Badge key={tag} variant="outline" size="sm">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Action */}
                <Button
                  variant="outline"
                  className="w-full mt-auto"
                  onClick={() => setSelectedListing(listing)}
                >
                  View Details
                </Button>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>
      ) : (
        <EmptyState
          title="No listings found"
          description={listings.length === 0 ? "Be the first to create a listing!" : "Try adjusting your search or filters"}
          action={{
            label: listings.length === 0 ? 'Create Listing' : 'Clear Filters',
            onClick: clearFilters,
          }}
        />
      )}

      {/* Listing Detail Modal */}
      {selectedListing && (
        <Modal
          isOpen={!!selectedListing}
          onClose={() => setSelectedListing(null)}
          title={selectedListing.title}
          size="lg"
        >
          <div className="space-y-6">
            {/* User Info */}
            <div className="flex items-center gap-4 p-4 bg-[var(--bg-surface-highlight)] rounded-xl">
              <Avatar name={selectedListing.userName} src={selectedListing.userPhoto} size="lg" />
              <div className="flex-1">
                <h3 className="font-semibold text-[var(--text-primary)]">{selectedListing.userName}</h3>
                <div className="flex items-center gap-4 mt-1 text-sm text-[var(--text-secondary)]">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {selectedListing.availability}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {selectedListing.mode === 'online' ? 'Online only' :
                      selectedListing.mode === 'offline' ? 'In-person only' : 'Online or In-person'}
                  </span>
                </div>
              </div>
              <Badge
                variant={selectedListing.type === 'offer' ? 'success' : 'primary'}
                size="md"
              >
                {selectedListing.type === 'offer' ? 'Offering' : 'Requesting'}
              </Badge>
            </div>

            {/* Description */}
            <div>
              <h4 className="font-medium text-[var(--text-primary)] mb-2">About this {selectedListing.type === 'offer' ? 'offer' : 'request'}</h4>
              <p className="text-[var(--text-secondary)] leading-relaxed">{selectedListing.description}</p>
            </div>

            {/* Tags */}
            <div>
              <h4 className="font-medium text-[var(--text-primary)] mb-2">Skills / Topics</h4>
              <div className="flex flex-wrap gap-2">
                {selectedListing.tags.map((tag) => (
                  <Badge key={tag} variant="primary" size="md">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t sticky bottom-0 bg-[var(--bg-surface)] pb-1">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setSelectedListing(null)}
              >
                Close
              </Button>
              <Button
                className="flex-1"
                leftIcon={<MessageCircle className="h-4 w-4" />}
                onClick={() => handleConnect(selectedListing)}
              >
                Connect with {selectedListing.userName.split(' ')[0]}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
