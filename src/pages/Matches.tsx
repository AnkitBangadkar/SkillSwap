import { useState } from 'react';
import { Sparkles, MessageCircle, Filter } from 'lucide-react';
import { Card, Button, Badge, Avatar, EmptyState, Select } from '../components/ui';
import type { Match, ListingType } from '../types';

// Mock data for demo
const mockMatches: (Match & { user: { name: string; photo: string } })[] = [
  {
    listing: {
      id: '1',
      userId: 'user1',
      userName: 'Ananya Gupta',
      userPhoto: '',
      title: 'React & TypeScript Help',
      description: 'Looking for help with React hooks and TypeScript integration in my project.',
      type: 'request' as ListingType,
      tags: ['React', 'TypeScript', 'JavaScript'],
      availability: 'Weekday evenings',
      mode: 'online',
      status: 'active',
      createdAt: new Date() as any,
    },
    matchScore: 92,
    explanation: 'You both share expertise in React and TypeScript. Ananya needs exactly what you offer!',
    user: { name: 'Ananya Gupta', photo: '' },
  },
  {
    listing: {
      id: '2',
      userId: 'user2',
      userName: 'Rohit Sharma',
      userPhoto: '',
      title: 'Python for Machine Learning',
      description: 'I can teach Python and ML basics, including scikit-learn and pandas.',
      type: 'offer' as ListingType,
      tags: ['Python', 'Machine Learning', 'Data Science'],
      availability: 'Flexible',
      mode: 'both',
      status: 'active',
      createdAt: new Date() as any,
    },
    matchScore: 78,
    explanation: 'Rohit offers Python and ML skills that match your learning request.',
    user: { name: 'Rohit Sharma', photo: '' },
  },
  {
    listing: {
      id: '3',
      userId: 'user3',
      userName: 'Priya Nair',
      userPhoto: '',
      title: 'Guitar Lessons',
      description: 'Beginner-friendly guitar lessons. I specialize in acoustic and fingerstyle.',
      type: 'offer' as ListingType,
      tags: ['Guitar', 'Music', 'Acoustic'],
      availability: 'Weekend afternoons',
      mode: 'offline',
      status: 'active',
      createdAt: new Date() as any,
    },
    matchScore: 65,
    explanation: 'Priya can teach guitar, which matches your request for music lessons.',
    user: { name: 'Priya Nair', photo: '' },
  },
];

export default function Matches() {
  const [typeFilter, setTypeFilter] = useState<string>('');

  const filteredMatches = mockMatches.filter((match) => {
    if (typeFilter && match.listing.type !== typeFilter) return false;
    return true;
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-indigo-600" />
            Your Matches
          </h1>
          <p className="text-gray-600 mt-1">
            AI-powered matches based on your listings and interests
          </p>
        </div>
        <Select
          options={[
            { value: 'offer', label: 'People offering skills' },
            { value: 'request', label: 'People requesting skills' },
          ]}
          value={typeFilter}
          onChange={setTypeFilter}
          placeholder="All matches"
          className="w-48"
        />
      </div>

      {/* AI Explanation Banner */}
      <Card padding="md" className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-100">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Powered by Google Gemini</p>
            <p className="text-sm text-gray-600">
              Each match includes an AI-generated explanation of why you're compatible
            </p>
          </div>
        </div>
      </Card>

      {/* Matches List */}
      {filteredMatches.length > 0 ? (
        <div className="space-y-4">
          {filteredMatches.map((match) => (
            <Card key={match.listing.id} padding="lg" hover>
              <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                {/* User & Score */}
                <div className="flex items-center gap-3 lg:w-48 flex-shrink-0">
                  <Avatar
                    name={match.user.name}
                    src={match.user.photo}
                    size="lg"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{match.user.name}</p>
                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-sm font-medium ${getScoreColor(match.matchScore)}`}>
                      <Sparkles className="h-3 w-3" />
                      {match.matchScore}% match
                    </div>
                  </div>
                </div>

                {/* Listing Details */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant={match.listing.type === 'offer' ? 'success' : 'primary'}
                      size="sm"
                    >
                      {match.listing.type === 'offer' ? 'Offers' : 'Needs'}
                    </Badge>
                    <span className="text-sm text-gray-500">{match.listing.availability}</span>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {match.listing.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {match.listing.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {match.listing.tags.map((tag) => (
                      <Badge key={tag} variant="outline" size="sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* AI Explanation */}
                  {match.explanation && (
                    <div className="bg-indigo-50 rounded-lg p-3 flex items-start gap-2">
                      <Sparkles className="h-4 w-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-indigo-800">{match.explanation}</p>
                    </div>
                  )}
                </div>

                {/* Action */}
                <div className="flex lg:flex-col gap-2 lg:w-32">
                  <Button className="flex-1" leftIcon={<MessageCircle className="h-4 w-4" />}>
                    Connect
                  </Button>
                  <Button variant="outline" className="flex-1">
                    View
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Sparkles className="h-8 w-8" />}
          title="No matches yet"
          description="Create more listings to get matched with compatible peers"
          action={{
            label: 'Create Listing',
            onClick: () => {},
          }}
        />
      )}
    </div>
  );
}
