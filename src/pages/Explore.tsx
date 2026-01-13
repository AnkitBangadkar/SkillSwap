import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input, Button, Badge, Card, Avatar, EmptyState, Select } from '../components/ui';
import { SKILL_CATEGORIES, MODE_OPTIONS } from '../lib/constants';
import type { ListingType, ListingMode } from '../types';

// Mock data for demo
const mockListings = [
  {
    id: '1',
    userId: 'user1',
    userName: 'Ananya Gupta',
    userPhoto: '',
    title: 'React & TypeScript Tutoring',
    description: 'I can help you learn React with TypeScript from basics to advanced concepts. Experienced with hooks, context, and state management.',
    type: 'offer' as ListingType,
    tags: ['React', 'TypeScript', 'Web Development'],
    availability: 'Weekday evenings',
    mode: 'both' as ListingMode,
    status: 'active' as const,
    createdAt: new Date(),
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'Vikram Singh',
    userPhoto: '',
    title: 'Need help with Machine Learning',
    description: 'Looking for someone to explain ML concepts and help with my project on neural networks.',
    type: 'request' as ListingType,
    tags: ['Machine Learning', 'Python', 'Data Science'],
    availability: 'Flexible',
    mode: 'online' as ListingMode,
    status: 'active' as const,
    createdAt: new Date(),
  },
  {
    id: '3',
    userId: 'user3',
    userName: 'Meera Patel',
    userPhoto: '',
    title: 'Guitar Lessons for Beginners',
    description: 'I\'ve been playing guitar for 5 years. Can teach basics, chords, and some popular songs.',
    type: 'offer' as ListingType,
    tags: ['Guitar', 'Music'],
    availability: 'Weekend afternoons',
    mode: 'offline' as ListingMode,
    status: 'active' as const,
    createdAt: new Date(),
  },
  {
    id: '4',
    userId: 'user4',
    userName: 'Arjun Reddy',
    userPhoto: '',
    title: 'Spanish Language Exchange',
    description: 'Native Spanish speaker looking to practice English. Can help you with Spanish in return!',
    type: 'offer' as ListingType,
    tags: ['Spanish', 'English', 'Languages'],
    availability: 'Weekday mornings',
    mode: 'both' as ListingMode,
    status: 'active' as const,
    createdAt: new Date(),
  },
  {
    id: '5',
    userId: 'user5',
    userName: 'Sneha Krishnan',
    userPhoto: '',
    title: 'UI/UX Design Mentorship',
    description: 'Senior design student offering mentorship in UI/UX. Experienced with Figma, user research, and prototyping.',
    type: 'offer' as ListingType,
    tags: ['UI/UX Design', 'Figma', 'Graphic Design'],
    availability: 'Flexible',
    mode: 'online' as ListingMode,
    status: 'active' as const,
    createdAt: new Date(),
  },
];

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [modeFilter, setModeFilter] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Filter listings
  const filteredListings = mockListings.filter((listing) => {
    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        listing.title.toLowerCase().includes(query) ||
        listing.description.toLowerCase().includes(query) ||
        listing.tags.some((tag) => tag.toLowerCase().includes(query));
      if (!matchesSearch) return false;
    }

    // Type filter
    if (typeFilter && listing.type !== typeFilter) return false;

    // Mode filter
    if (modeFilter && listing.mode !== modeFilter && listing.mode !== 'both') return false;

    // Tags filter
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

  const hasActiveFilters = searchQuery || typeFilter || modeFilter || selectedTags.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Explore Skills</h1>
        <p className="text-gray-600 mt-1">
          Discover skills offered and requested by your peers
        </p>
      </div>

      {/* Search & Filters */}
      <div className="space-y-4">
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
              <span className="ml-1 h-5 w-5 rounded-full bg-indigo-200 text-indigo-700 text-xs flex items-center justify-center">
                !
              </span>
            )}
          </Button>
        </div>

        {/* Filter Panel */}
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

            {/* Category Tags */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Quick Filters</p>
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
      </div>

      {/* Results Count */}
      <p className="text-sm text-gray-500">
        Showing {filteredListings.length} of {mockListings.length} listings
      </p>

      {/* Listings Grid */}
      {filteredListings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredListings.map((listing) => (
            <Card key={listing.id} hover padding="md" className="flex flex-col">
              {/* User Info */}
              <div className="flex items-center gap-3 mb-3">
                <Avatar name={listing.userName} src={listing.userPhoto} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{listing.userName}</p>
                  <p className="text-xs text-gray-500">{listing.availability}</p>
                </div>
                <Badge
                  variant={listing.type === 'offer' ? 'success' : 'primary'}
                  size="sm"
                >
                  {listing.type === 'offer' ? 'Offers' : 'Needs'}
                </Badge>
              </div>

              {/* Listing Content */}
              <h3 className="font-semibold text-gray-900 mb-2">{listing.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-2 mb-3 flex-1">
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
              <Button variant="outline" className="w-full">
                View Details
              </Button>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No listings found"
          description="Try adjusting your search or filters"
          action={{
            label: 'Clear Filters',
            onClick: clearFilters,
          }}
        />
      )}
    </div>
  );
}
