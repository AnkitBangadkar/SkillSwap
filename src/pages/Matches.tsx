import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Loader2, MessageCircle } from 'lucide-react';
import { Card, Button, EmptyState, Avatar, Badge } from '../components/ui';
import { StaggerContainer, StaggerItem, FadeIn } from '../components/ui/Motion';
import { ROUTES } from '../lib/constants';
import { getMatchesForUser } from '../services/matching';
import { createChat } from '../services/chat';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';
import type { Match } from '../types';

export default function Matches() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { showToast } = useUIStore();
  
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchMatches() {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const result = await getMatchesForUser(user.id);
        setMatches(result);
      } catch (error) {
        console.error('Failed to fetch matches:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMatches();
  }, [user]);

  const handleConnect = async (match: Match) => {
    if (!user) return;

    try {
      const chatId = await createChat(
        match.listing.id,
        match.listing.title,
        user.id,
        user.name,
        user.photoURL,
        match.listing.userId,
        match.listing.userName,
        match.listing.userPhoto
      );

      showToast({
        type: 'success',
        message: `Connected with ${match.listing.userName}!`,
      });
      
      navigate(ROUTES.chatRoom(chatId));
    } catch (error) {
      console.error('Failed to connect:', error);
      showToast({
        type: 'error',
        message: 'Failed to start conversation. Please try again.',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <FadeIn>
        <h1 className="text-2xl font-display font-bold text-[var(--text-primary)]">AI Matches</h1>
        <p className="text-[var(--text-secondary)] mt-1">
          Discover peers with complementary skills
        </p>
      </FadeIn>

      {/* How Matching Works */}
      <FadeIn delay={0.1}>
        <Card padding="lg" className="bg-[var(--bg-surface-highlight)] border-2 border-[var(--border-default)]">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-[var(--color-primary-100)] border-2 border-[var(--border-default)] text-[var(--color-primary-600)] flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-[var(--text-primary)] mb-1">How AI Matching Works</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-3">
                Our AI analyzes your listings and finds peers whose skills complement yours.
                If you're offering Python and someone needs Python help, you'll match!
              </p>
              <Button size="sm" onClick={() => navigate(ROUTES.explore)}>
                Explore Listings
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </Card>
      </FadeIn>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary-600)]" />
        </div>
      ) : matches.length > 0 ? (
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-4" delay={0.2}>
          {matches.map(({ listing, matchScore }) => (
            <StaggerItem key={listing.id}>
              <Card hover padding="md" className="flex flex-col h-full border-2 border-[var(--border-default)]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={listing.userName} src={listing.userPhoto} size="md" />
                    <div>
                      <p className="font-bold text-[var(--text-primary)]">{listing.userName}</p>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={listing.type === 'offer' ? 'success' : 'primary'}
                          size="sm"
                        >
                          {listing.type === 'offer' ? 'Offers' : 'Needs'}
                        </Badge>
                        <span className="text-xs text-[var(--text-tertiary)]">{listing.availability}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="radial-progress text-[var(--color-primary-600)] font-bold text-sm" style={{ "--value": Math.min(matchScore * 20, 100), "--size": "2.5rem" } as any}>
                      {Math.round(matchScore * 10)}%
                    </div>
                    <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] mt-1">Match</span>
                  </div>
                </div>

                <h3 className="font-display font-bold text-lg text-[var(--text-primary)] mb-2">{listing.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-4 flex-1">
                  {listing.description}
                </p>

                <div className="flex flex-wrap gap-1 mb-4">
                  {listing.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" size="sm">
                      {tag}
                    </Badge>
                  ))}
                  {listing.tags.length > 3 && (
                    <span className="text-xs text-[var(--text-tertiary)] flex items-center">+{listing.tags.length - 3} more</span>
                  )}
                </div>

                <Button
                  className="w-full mt-auto"
                  onClick={() => handleConnect({ listing, matchScore })}
                  leftIcon={<MessageCircle className="h-4 w-4" />}
                >
                  Connect
                </Button>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>
      ) : (
        <FadeIn delay={0.2}>
          <EmptyState
            icon={<Sparkles className="h-8 w-8" />}
            title="No matches found yet"
            description="Try adding more listings or tags to increase your chances of finding a match."
            action={{
              label: 'Create a Listing',
              onClick: () => navigate(ROUTES.createListing),
            }}
          />
        </FadeIn>
      )}
    </div>
  );
}
