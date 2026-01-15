import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Loader2, MessageCircle } from 'lucide-react';
import { Card, Button, EmptyState, Avatar, Badge } from '../components/ui';
import { StaggerContainer, StaggerItem, FadeIn } from '../components/ui/Motion';
import { ROUTES } from '../lib/constants';
import { getMatchesForUser } from '../services/matching';
import { getUserListings } from '../services/listings';
import { generateMatchExplanation } from '../services/gemini';
import { createChat } from '../services/chat';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';
import type { Match, Listing } from '../types';

export default function Matches() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { showToast } = useUIStore();
  
  const [matches, setMatches] = useState<Match[]>([]);
  const [userListings, setUserListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingExplanations, setLoadingExplanations] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchMatchesAndListings() {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Fetch matches and user's own listings in parallel
        const [matchResults, userListingResults] = await Promise.all([
          getMatchesForUser(user.id),
          getUserListings(user.id),
        ]);
        setMatches(matchResults);
        setUserListings(userListingResults);
      } catch (error) {
        console.error('Failed to fetch matches:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMatchesAndListings();
  }, [user]);

  // Find the best matching user listing for a given match
  const findBestUserListing = (matchListing: Listing): Listing | null => {
    // Find a user listing of opposite type that shares tags with the match
    const oppositeType = matchListing.type === 'offer' ? 'request' : 'offer';
    const matchTags = new Set(matchListing.tags.map(t => t.toLowerCase()));
    
    const relevantListings = userListings.filter(ul => ul.type === oppositeType);
    
    if (relevantListings.length === 0) return null;
    
    // Find the one with most overlapping tags
    let bestListing = relevantListings[0];
    let bestScore = 0;
    
    for (const listing of relevantListings) {
      const score = listing.tags.filter(t => matchTags.has(t.toLowerCase())).length;
      if (score > bestScore) {
        bestScore = score;
        bestListing = listing;
      }
    }
    
    return bestListing;
  };

  // Generate AI explanation for a specific match
  const generateExplanationForMatch = async (match: Match) => {
    if (match.explanation || !user) return;

    // Mark as loading
    setLoadingExplanations(prev => new Set(prev).add(match.listing.id));

    try {
      // Find the user's listing that matches with this one
      const userListing = findBestUserListing(match.listing);
      
      if (!userListing) {
        console.warn('No matching user listing found for explanation');
        return;
      }

      const explanation = await generateMatchExplanation(match.listing, userListing);

      if (explanation) {
        setMatches(prevMatches =>
          prevMatches.map(m =>
            m.listing.id === match.listing.id
              ? { ...m, explanation }
              : m
          )
        );
      }
    } catch (error) {
      console.error('Failed to generate explanation:', error);
    } finally {
      setLoadingExplanations(prev => {
        const next = new Set(prev);
        next.delete(match.listing.id);
        return next;
      });
    }
  };

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
          {matches.map((match) => {
            const { listing, matchScore, explanation } = match;
            const isLoadingExplanation = loadingExplanations.has(listing.id);

            return (
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

                  {/* AI Insight */}
                  {matchScore >= 5 && (
                    <div className="mb-4">
                      <div className="bg-[var(--color-primary-50)] border border-[var(--color-primary-200)] rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <Sparkles className="h-4 w-4 text-[var(--color-primary-600)] flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            {explanation ? (
                              <p className="text-sm text-[var(--color-primary-900)]">
                                {explanation}
                              </p>
                            ) : (
                              <button
                                onClick={() => generateExplanationForMatch(match)}
                                disabled={isLoadingExplanation}
                                className="text-sm font-medium text-[var(--color-primary-700)] hover:text-[var(--color-primary-900)] disabled:opacity-50 flex items-center gap-1"
                              >
                                {isLoadingExplanation ? (
                                  <>
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    Generating insight...
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="h-3 w-3" />
                                    See why you match
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

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
                    onClick={() => handleConnect(match)}
                    leftIcon={<MessageCircle className="h-4 w-4" />}
                  >
                    Connect
                  </Button>
                </Card>
              </StaggerItem>
            );
          })}
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
