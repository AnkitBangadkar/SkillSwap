import { useState } from 'react';
import { Camera, Mail, Calendar, Edit2, Save, X } from 'lucide-react';
import { Card, Button, Input, Avatar, Badge } from '../components/ui';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';
import { formatDate } from '../lib/utils';

// Mock user listings for profile
const mockUserListings = [
  {
    id: '1',
    title: 'Python for Data Science',
    type: 'offer' as const,
    tags: ['Python', 'Data Science'],
    status: 'active' as const,
  },
  {
    id: '2',
    title: 'Need help with Guitar',
    type: 'request' as const,
    tags: ['Guitar', 'Music'],
    status: 'active' as const,
  },
];

export default function Profile() {
  const { user } = useAuthStore();
  const { showToast } = useUIStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');

  const handleSave = async () => {
    // TODO: Implement actual profile update
    showToast({
      type: 'success',
      message: 'Profile updated successfully!',
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedName(user?.name || '');
    setIsEditing(false);
  };

  if (!user) return null;

  const stats = [
    { label: 'Listings', value: 2 },
    { label: 'Sessions', value: 5 },
    { label: 'Connections', value: 8 },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card padding="lg">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="relative group">
            <Avatar
              src={user.photoURL}
              name={user.name}
              size="xl"
              className="h-24 w-24"
            />
            <button className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="h-6 w-6 text-white" />
            </button>
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            {isEditing ? (
              <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="max-w-xs"
                />
                <Button size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={handleCancel}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                {user.email}
              </div>
              {user.collegeEmail && (
                <div className="flex items-center gap-1 text-indigo-600">
                  <Badge variant="success" size="sm" className="gap-1">
                    ✓ Verified
                  </Badge>
                  {user.collegeEmail}
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Joined {user.createdAt ? formatDate(user.createdAt.toDate()) : 'Recently'}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* My Listings */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">My Listings</h2>
        <div className="space-y-3">
          {mockUserListings.map((listing) => (
            <Card key={listing.id} hover padding="md">
              <div className="flex items-center justify-between">
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
                    {listing.tags.map((tag) => (
                      <Badge key={tag} variant="outline" size="sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Account Settings Preview */}
      <Card padding="lg">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div>
              <p className="font-medium text-gray-900">Email Notifications</p>
              <p className="text-sm text-gray-500">Receive updates about matches and messages</p>
            </div>
            <Button variant="outline" size="sm">Configure</Button>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-gray-900">Privacy Settings</p>
              <p className="text-sm text-gray-500">Control who can see your profile</p>
            </div>
            <Button variant="outline" size="sm">Manage</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
