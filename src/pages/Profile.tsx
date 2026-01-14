import { useState, useEffect } from 'react';
import { Camera, Mail, Calendar, Edit2, Save, X, Loader2, GraduationCap } from 'lucide-react';
import { Card, Button, Input, Avatar, Badge, EmptyState } from '../components/ui';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';
import { formatDate } from '../lib/utils';
import { getUserListings } from '../services/listings';
import type { Listing } from '../types';

export default function Profile() {
  const { user } = useAuthStore();
  const { showToast } = useUIStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
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

  const handleSave = async () => {
    showToast({
      type: 'info',
      message: 'Profile name is synced from your Google account',
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedName(user?.name || '');
    setIsEditing(false);
  };

  if (!user) return null;

  // Calculate stats from real data
  const stats = [
    { label: 'Listings', value: userListings.length },
    { label: 'Sessions', value: 0 },
    { label: 'Connections', value: 0 },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card padding="lg">
        <div className="space-y-6">
          {/* Top Row: Avatar, Name, Stats */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative group flex-shrink-0">
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

            {/* Name & Edit */}
            <div className="flex-1 text-center sm:text-left">
              {isEditing ? (
                <div className="flex items-center gap-2 justify-center sm:justify-start">
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
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="flex gap-6 flex-shrink-0">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Emails & Info Section */}
          <div className="pt-4 border-t border-gray-100 space-y-3">
            {/* Google Email */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Mail className="h-4 w-4 flex-shrink-0" />
              <span>{user.email}</span>
            </div>

            {/* Verified College Email */}
            {user.collegeEmail && (
              <div className="flex items-center gap-2 text-sm">
                <GraduationCap className="h-4 w-4 text-green-600 flex-shrink-0" />
                <Badge variant="success" size="sm">Verified</Badge>
                <span className="text-green-700 font-medium">{user.collegeEmail}</span>
              </div>
            )}

            {/* Join Date */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span>Joined {user.createdAt ? formatDate(user.createdAt.toDate()) : 'Recently'}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* My Listings */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">My Listings</h2>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
          </div>
        ) : userListings.length > 0 ? (
          <div className="space-y-3">
            {userListings.map((listing) => (
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
        ) : (
          <EmptyState
            title="No listings yet"
            description="Create your first listing to start sharing skills"
          />
        )}
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
