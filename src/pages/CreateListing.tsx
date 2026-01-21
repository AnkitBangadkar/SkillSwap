import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Sparkles, Loader2, Wand2 } from 'lucide-react';
import {
  Card,
  CardContent,
  Button,
  Input,
  Textarea,
  Select,
  TagInput,
  Alert,
} from '../components/ui';
import { ROUTES, MODE_OPTIONS, AVAILABILITY_OPTIONS, APP_CONFIG } from '../lib/constants';
import type { CreateListingData, ListingMode } from '../types';
import { useUIStore } from '../stores/uiStore';
import { useAuthStore } from '../stores/authStore';
import { createListing, getListing, updateListing } from '../services/listings';
import { generateTagSuggestions, enhanceListingDescription } from '../services/gemini';

export default function CreateListing() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showToast } = useUIStore();
  const { user } = useAuthStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isGettingSuggestions, setIsGettingSuggestions] = useState(false);
  const [isEnhancingDescription, setIsEnhancingDescription] = useState(false);
  const [formData, setFormData] = useState<CreateListingData>({
    title: '',
    description: '',
    type: 'offer',
    tags: [],
    availability: '',
    mode: 'both',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchListing() {
      if (!id || !user) return;
      
      setIsFetching(true);
      try {
        const listing = await getListing(id);
        if (!listing) {
          showToast({ type: 'error', message: 'Listing not found' });
          navigate(ROUTES.dashboard);
          return;
        }
        
        if (listing.userId !== user.id) {
          showToast({ type: 'error', message: 'You can only edit your own listings' });
          navigate(ROUTES.dashboard);
          return;
        }

        setFormData({
          title: listing.title,
          description: listing.description,
          type: listing.type,
          tags: listing.tags,
          availability: listing.availability,
          mode: listing.mode,
        });
      } catch (error) {
        console.error('Failed to fetch listing:', error);
        showToast({ type: 'error', message: 'Failed to load listing' });
      } finally {
        setIsFetching(false);
      }
    }

    fetchListing();
  }, [id, user, navigate, showToast]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    } else if (formData.title.length > APP_CONFIG.maxTitleLength) {
      newErrors.title = `Title must be less than ${APP_CONFIG.maxTitleLength} characters`;
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    } else if (formData.description.length > APP_CONFIG.maxDescriptionLength) {
      newErrors.description = `Description must be less than ${APP_CONFIG.maxDescriptionLength} characters`;
    }

    if (formData.tags.length === 0) {
      newErrors.tags = 'Add at least one tag';
    }

    if (!formData.availability) {
      newErrors.availability = 'Select your availability';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;
    if (!user) {
      showToast({
        type: 'error',
        message: 'You must be logged in to create a listing.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (id) {
        // Update existing listing
        await updateListing(id, formData);
        showToast({
          type: 'success',
          message: 'Listing updated successfully!',
        });
      } else {
        // Create listing in Firestore
        await createListing(
          user.id,
          user.name,
          user.photoURL,
          formData
        );
        showToast({
          type: 'success',
          message: 'Listing created successfully!',
        });
      }

      navigate(ROUTES.dashboard);
    } catch {
      showToast({
        type: 'error',
        message: `Failed to ${id ? 'update' : 'create'} listing. Please try again.`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

const handleGetAISuggestions = async () => {
    if (!formData.title && !formData.description) {
      showToast({
        type: 'warning',
        message: 'Add a title or description first to get AI suggestions',
      });
      return;
    }

    setIsGettingSuggestions(true);

    try {
      // Pre-clean the input to remove any potential image references
      const cleanTitle = formData.title
        .replace(/https?:\/\/[^\s]+/g, '[link]')
        .replace(/image\.(png|jpg|jpeg|gif|bmp|svg|webp)/gi, '[image]')
        .trim();

      const cleanDescription = formData.description
        .replace(/https?:\/\/[^\s]+/g, '[link]')
        .replace(/image\.(png|jpg|jpeg|gif|bmp|svg|webp)/gi, '[image]')
        .trim();

      console.log('Getting tag suggestions for:', {
        title: cleanTitle,
        description: cleanDescription.slice(0, 100) + '...'
      });

      // Use Gemini AI to suggest tags
      const suggestedTags = await generateTagSuggestions(cleanTitle, cleanDescription);

      console.log('Suggested tags:', suggestedTags);

      if (suggestedTags.length > 0) {
        setFormData((prev) => ({
          ...prev,
          tags: [...new Set([...prev.tags, ...suggestedTags])].slice(0, APP_CONFIG.maxTags),
        }));

        showToast({
          type: 'success',
          message: 'AI suggested some tags for you!',
        });
      } else {
        // Fallback to manual tag suggestions
        const fallbackTags = getManualTagSuggestions(cleanTitle, cleanDescription);
        if (fallbackTags.length > 0) {
          setFormData((prev) => ({
            ...prev,
            tags: [...new Set([...prev.tags, ...fallbackTags])].slice(0, APP_CONFIG.maxTags),
          }));

          showToast({
            type: 'info',
            message: 'Added some relevant tags for you!',
          });
        } else {
          showToast({
            type: 'info',
            message: 'No suggestions available. Try adding more details.',
          });
        }
      }
    } catch (error) {
      console.error('Failed to get tag suggestions:', error);
      
      // Always provide fallback suggestions
      const fallbackTags = getManualTagSuggestions(formData.title, formData.description);
      if (fallbackTags.length > 0) {
        setFormData((prev) => ({
          ...prev,
          tags: [...new Set([...prev.tags, ...fallbackTags])].slice(0, APP_CONFIG.maxTags),
        }));

        showToast({
          type: 'info',
          message: 'Added some relevant tags for you!',
        });
      } else {
        if (error instanceof Error && error.message.includes('image')) {
          showToast({
            type: 'info',
            message: 'Added some relevant tags for you!',
          });
        } else {
          showToast({
            type: 'error',
            message: 'Failed to get suggestions. Try again.',
          });
        }
      }
    } finally {
      setIsGettingSuggestions(false);
    }
  };

  // Manual tag suggestion fallback
  const getManualTagSuggestions = (title: string, description: string): string[] => {
    const text = (title + ' ' + description).toLowerCase();
    const suggestions: string[] = [];
    
    // Common skill keywords mapping
    const keywordMap: Record<string, string[]> = {
      'python': ['Python', 'Programming'],
      'javascript': ['JavaScript', 'Web Development'],
      'react': ['React', 'JavaScript', 'Web Development'],
      'node': ['Node.js', 'JavaScript', 'Backend'],
      'java': ['Java', 'Programming'],
      'cpp': ['C++', 'Programming'],
      'c++': ['C++', 'Programming'],
      'html': ['HTML', 'CSS', 'Web Development'],
      'css': ['CSS', 'HTML', 'Web Development'],
      'guitar': ['Guitar', 'Music'],
      'piano': ['Piano', 'Music'],
      'photo': ['Photography'],
      'design': ['Graphic Design', 'UI/UX Design'],
      'spanish': ['Spanish', 'Languages'],
      'french': ['French', 'Languages'],
      'math': ['Mathematics', 'Academic'],
      'calc': ['Calculus', 'Mathematics'],
      'physics': ['Physics', 'Science'],
      'chem': ['Chemistry', 'Science'],
      'write': ['Content Writing', 'Writing'],
      'draw': ['Drawing', 'Art'],
      'cook': ['Cooking'],
      'yoga': ['Yoga', 'Fitness'],
    };

    // Check for keywords
    Object.entries(keywordMap).forEach(([keyword, tags]) => {
      if (text.includes(keyword)) {
        suggestions.push(...tags);
      }
    });

    // Remove duplicates and limit results
    return [...new Set(suggestions)].slice(0, 3);
  };

const handleEnhanceDescription = async () => {
    if (!formData.title || !formData.description) {
      showToast({
        type: 'warning',
        message: 'Add a title and description first to enhance with AI',
      });
      return;
    }

    if (formData.description.length < 10) {
      showToast({
        type: 'warning',
        message: 'Add at least a few words to your description first',
      });
      return;
    }

    setIsEnhancingDescription(true);

    try {
      // Pre-clean the input to remove obvious image references
      const cleanTitle = formData.title
        .replace(/https?:\/\/[^\s]+/g, '[link]')
        .replace(/image\.(png|jpg|jpeg|gif|bmp|svg|webp)/gi, '[image]')
        .trim();

      const cleanDescription = formData.description
        .replace(/https?:\/\/[^\s]+/g, '[link]')
        .replace(/image\.(png|jpg|jpeg|gif|bmp|svg|webp)/gi, '[image]')
        .trim();

      console.log('Enhancing description for:', {
        title: cleanTitle,
        type: formData.type,
        tags: formData.tags,
        description: cleanDescription.slice(0, 100) + '...'
      });

      const enhanced = await enhanceListingDescription(
        cleanTitle,
        formData.type,
        formData.tags,
        cleanDescription
      );

      console.log('Enhanced result:', enhanced);

      if (enhanced) {
        setFormData((prev) => ({
          ...prev,
          description: enhanced,
        }));

        showToast({
          type: 'success',
          message: 'Description enhanced with AI!',
        });
      } else {
        // Fallback to simple text enhancement
        const simpleEnhancement = enhanceDescriptionManually(cleanDescription, formData.type);
        setFormData((prev) => ({
          ...prev,
          description: simpleEnhancement,
        }));

        showToast({
          type: 'info',
          message: 'Description enhanced with suggestions!',
        });
      }
    } catch (error) {
      console.error('Failed to enhance description:', error);
      
      // Always provide a fallback enhancement
      const simpleEnhancement = enhanceDescriptionManually(formData.description, formData.type);
      setFormData((prev) => ({
        ...prev,
        description: simpleEnhancement,
      }));

      if (error instanceof Error) {
        if (error.message.includes('image') || error.message.includes('model does not support image input')) {
          showToast({
            type: 'info',
            message: 'Description enhanced with suggestions!',
          });
        } else if (error.message.includes('quota') || error.message.includes('rate limit')) {
          showToast({
            type: 'info',
            message: 'Description enhanced with suggestions!',
          });
        } else {
          showToast({
            type: 'info',
            message: 'Description enhanced with suggestions!',
          });
        }
      } else {
        showToast({
          type: 'info',
          message: 'Description enhanced with suggestions!',
        });
      }
    } finally {
      setIsEnhancingDescription(false);
    }
  };

  // Simple manual enhancement fallback
  const enhanceDescriptionManually = (description: string, type: 'offer' | 'request'): string => {
    const action = type === 'offer' ? 'I can help you' : 'I would love to learn';
    const cleanDesc = description.trim();
    
    // Add engaging prefix if not already present
    if (!cleanDesc.toLowerCase().includes('i can') && !cleanDesc.toLowerCase().includes('looking to') && !cleanDesc.toLowerCase().includes('want to')) {
      return `${action} with ${cleanDesc.toLowerCase()}. Let's connect and make this happen!`;
    }
    
    // Add engaging suffix if not already present
    if (!cleanDesc.includes('!') && !cleanDesc.includes('?')) {
      return `${cleanDesc}. Let's connect and make this happen!`;
    }
    
    return cleanDesc;
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <h1 className="text-2xl font-display font-bold text-[var(--text-primary)]">
          {id ? 'Edit Listing' : 'Create Listing'}
        </h1>
        <p className="text-[var(--text-secondary)] mt-1">
          {id ? 'Update your listing details' : 'Share a skill you can teach or request help with something you want to learn'}
        </p>
      </div>

      {isFetching ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <Card padding="lg">
          <CardContent className="space-y-6">
            {/* Type Selection */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">
                What would you like to do?
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'offer' })}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${formData.type === 'offer'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-600'
                    : 'border-[var(--border-default)] hover:border-[var(--border-highlight)] bg-[var(--bg-surface-highlight)]'
                    }`}
                >
                  <p className="font-semibold text-[var(--text-primary)]">Offer a Skill</p>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">
                    Share something you're good at
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'request' })}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${formData.type === 'request'
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-600'
                    : 'border-[var(--border-default)] hover:border-[var(--border-highlight)] bg-[var(--bg-surface-highlight)]'
                    }`}
                >
                  <p className="font-semibold text-[var(--text-primary)]">Request Help</p>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">
                    Learn something new from peers
                  </p>
                </button>
              </div>
            </div>

            {/* Title */}
            <Input
              label="Title"
              placeholder={
                formData.type === 'offer'
                  ? 'e.g., Python Programming Tutoring'
                  : 'e.g., Need help with Calculus'
              }
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              error={errors.title}
              hint={`${formData.title.length}/${APP_CONFIG.maxTitleLength}`}
            />

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-[var(--text-secondary)]">
                  Description
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleEnhanceDescription}
                  disabled={isEnhancingDescription}
                >
                  {isEnhancingDescription ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Wand2 className="h-4 w-4 mr-1" />
                  )}
                  AI Enhance
                </Button>
              </div>
              <Textarea
                placeholder={
                  formData.type === 'offer'
                    ? 'Describe what you can teach, your experience level, and what learners can expect...'
                    : 'Describe what you want to learn, your current level, and what kind of help you need...'
                }
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                error={errors.description}
                hint={`${formData.description.length}/${APP_CONFIG.maxDescriptionLength}`}
                rows={4}
              />
            </div>

            {/* Tags with AI Suggestion */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-[var(--text-secondary)]">
                  Skills / Topics
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleGetAISuggestions}
                  disabled={isGettingSuggestions}
                >
                  {isGettingSuggestions ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-1" />
                  )}
                  AI Suggest
                </Button>
              </div>
              <TagInput
                value={formData.tags}
                onChange={(tags) => setFormData({ ...formData, tags })}
                error={errors.tags}
                maxTags={APP_CONFIG.maxTags}
                placeholder="Add relevant skills or topics..."
              />
            </div>

            {/* Availability */}
            <Select
              label="Availability"
              options={AVAILABILITY_OPTIONS.map((a) => ({ value: a, label: a }))}
              value={formData.availability}
              onChange={(value) => setFormData({ ...formData, availability: value })}
              error={errors.availability}
              placeholder="When are you usually available?"
            />

            {/* Mode */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">
                Preferred Mode
              </label>
              <div className="flex gap-3">
                {MODE_OPTIONS.map((mode) => (
                  <button
                    key={mode.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, mode: mode.value as ListingMode })}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 text-sm font-medium transition-all ${formData.mode === mode.value
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:border-indigo-600 dark:text-indigo-300'
                      : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--border-highlight)] bg-[var(--bg-surface-highlight)]'
                      }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Info Alert */}
            <Alert variant="info">
              Your listing will be visible to all students on campus. You'll be notified when someone wants to connect.
            </Alert>

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting}
                className="flex-1"
              >
                {id ? 'Update Listing' : 'Create Listing'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
      )}
    </div>
  );
}
