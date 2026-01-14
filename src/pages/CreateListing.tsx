import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
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
import { createListing } from '../services/listings';
import { generateTagSuggestions } from '../services/gemini';

export default function CreateListing() {
  const navigate = useNavigate();
  const { showToast } = useUIStore();
  const { user } = useAuthStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGettingSuggestions, setIsGettingSuggestions] = useState(false);
  const [formData, setFormData] = useState<CreateListingData>({
    title: '',
    description: '',
    type: 'offer',
    tags: [],
    availability: '',
    mode: 'both',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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

      navigate(ROUTES.dashboard);
    } catch {
      showToast({
        type: 'error',
        message: 'Failed to create listing. Please try again.',
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
      // Use Gemini AI to suggest tags
      const suggestedTags = await generateTagSuggestions(formData.title, formData.description);

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
        showToast({
          type: 'info',
          message: 'No suggestions available. Try adding more details.',
        });
      }
    } catch {
      showToast({
        type: 'error',
        message: 'Failed to get suggestions. Try again.',
      });
    } finally {
      setIsGettingSuggestions(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Create Listing</h1>
        <p className="text-gray-600 mt-1">
          Share a skill you can teach or request help with something you want to learn
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card padding="lg">
          <CardContent className="space-y-6">
            {/* Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                What would you like to do?
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'offer' })}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${formData.type === 'offer'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <p className="font-semibold text-gray-900">Offer a Skill</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Share something you're good at
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'request' })}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${formData.type === 'request'
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <p className="font-semibold text-gray-900">Request Help</p>
                  <p className="text-sm text-gray-500 mt-1">
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
            <Textarea
              label="Description"
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

            {/* Tags with AI Suggestion */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
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
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Preferred Mode
              </label>
              <div className="flex gap-3">
                {MODE_OPTIONS.map((mode) => (
                  <button
                    key={mode.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, mode: mode.value as ListingMode })}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 text-sm font-medium transition-all ${formData.mode === mode.value
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
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
                Create Listing
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
