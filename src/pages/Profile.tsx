import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Mail, Calendar, Edit2, Save, X, Loader2, GraduationCap, CalendarCheck, CalendarX, ExternalLink, Bell, Shield, Lock, Globe } from 'lucide-react';
import { Card, Button, Input, Avatar, Badge, EmptyState } from '../components/ui';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';
import { formatDate } from '../lib/utils';
import { getUserListings } from '../services/listings';
import { updateUserProfile } from '../services/auth';
import { linkCalendarWithGIS, unlinkGoogleCalendar, checkCalendarLinked } from '../services/calendar';
import { ROUTES } from '../lib/constants';
import { FadeIn, SlideUp } from '../components/ui/Motion';
import type { Listing } from '../types';

export default function Profile() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuthStore();
  const { showToast } = useUIStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  const [userListings, setUserListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [calendarLinked, setCalendarLinked] = useState(false);
  const [calendarLoading, setCalendarLoading] = useState(false);
  
  // Settings State
  const [emailEnabled, setEmailEnabled] = useState(user?.emailNotifications ?? true);
  const [privacyMode, setPrivacyMode] = useState<'public' | 'users_only'>(user?.privacySettings || 'public');

  // Fetch user's listings from Firestore
  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      setIsLoading(true);
      try {
        const [listings, isLinked] = await Promise.all([
          getUserListings(user.id),
          checkCalendarLinked(user.id),
        ]);
        setUserListings(listings);
        setCalendarLinked(isLinked);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [user]);

  const handleSave = async () => {
    if (!user || !editedName.trim()) return;

    try {
      await updateUserProfile(user.id, { name: editedName });
      await refreshUser();
      
      showToast({
        type: 'success',
        message: 'Profile updated successfully',
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      showToast({
        type: 'error',
        message: 'Failed to update profile',
      });
    }
  };

  const handleCancel = () => {
    setEditedName(user?.name || '');
    setIsEditing(false);
  };

  const handleConnectCalendar = async () => {
    if (!user) return;
    
    setCalendarLoading(true);
    try {
      const result = await linkCalendarWithGIS(user.id);
      
      if (result.success) {
        setCalendarLinked(true);
        showToast({
          type: 'success',
          message: 'Google Calendar connected! Your sessions will now sync automatically.',
        });
      } else {
        showToast({
          type: 'error',
          message: result.error || 'Failed to connect Google Calendar',
        });
      }
    } catch (error) {
      console.error('Calendar connect error:', error);
      showToast({
        type: 'error',
        message: 'Failed to connect Google Calendar',
      });
    } finally {
      setCalendarLoading(false);
    }
  };

  const handleDisconnectCalendar = async () => {
    if (!user) return;
    
    setCalendarLoading(true);
    try {
      await unlinkGoogleCalendar(user.id);
      setCalendarLinked(false);
      showToast({
        type: 'success',
        message: 'Google Calendar disconnected',
      });
    } catch (error) {
      console.error('Calendar disconnect error:', error);
      showToast({
        type: 'error',
        message: 'Failed to disconnect calendar',
      });
    } finally {
      setCalendarLoading(false);
    }
  };

  const handleToggleEmail = async () => {
    if (!user) return;
    const newValue = !emailEnabled;
    setEmailEnabled(newValue);
    
    try {
      await updateUserProfile(user.id, { emailNotifications: newValue });
      await refreshUser();
      showToast({ 
        type: 'success', 
        message: `Email notifications ${newValue ? 'enabled' : 'disabled'}` 
      });
    } catch (error) {
      console.error('Settings update error:', error);
      setEmailEnabled(!newValue); // Revert
      showToast({ type: 'error', message: 'Failed to update settings' });
    }
  };

  const handleTogglePrivacy = async () => {
    if (!user) return;
    const newMode = privacyMode === 'public' ? 'users_only' : 'public';
    setPrivacyMode(newMode);
    
    try {
      await updateUserProfile(user.id, { privacySettings: newMode });
      await refreshUser();
      showToast({ 
        type: 'success', 
        message: `Profile visibility set to ${newMode === 'public' ? 'Public' : 'Users Only'}` 
      });
    } catch (error) {
      console.error('Settings update error:', error);
      setPrivacyMode(privacyMode); // Revert
      showToast({ type: 'error', message: 'Failed to update settings' });
    }
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
      <FadeIn>
        <Card padding="lg" className="border-2 border-[var(--border-default)]">
          <div className="space-y-6">
            {/* Top Row: Avatar, Name, Stats */}
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Avatar */}
              <div className="relative group flex-shrink-0">
                <Avatar
                  src={user.photoURL}
                  name={user.name}
                  size="xl"
                  className="h-24 w-24 border-2 border-[var(--border-default)] shadow-[4px_4px_0px_0px_var(--border-default)]"
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
                    <h1 className="text-2xl font-display font-black text-[var(--text-primary)] uppercase tracking-tight">{user.name}</h1>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
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
                    <p className="text-2xl font-bold font-mono text-[var(--text-primary)]">{stat.value}</p>
                    <p className="text-xs font-bold uppercase tracking-wide text-[var(--text-tertiary)]">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Emails & Info Section */}
            <div className="pt-4 border-t-2 border-[var(--border-default)] space-y-3">
              {/* Google Email */}
              <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] font-mono">
                <Mail className="h-4 w-4 flex-shrink-0 text-[var(--text-tertiary)]" />
                <span>{user.email}</span>
              </div>

              {/* Verified College Email */}
              {user.collegeEmail && (
                <div className="flex items-center gap-2 text-sm font-mono">
                  <GraduationCap className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <Badge variant="success" size="sm" className="font-bold uppercase tracking-wider text-[10px]">Verified</Badge>
                  <span className="text-green-600 font-bold">{user.collegeEmail}</span>
                </div>
              )}

              {/* Join Date */}
              <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] font-mono">
                <Calendar className="h-4 w-4 flex-shrink-0 text-[var(--text-tertiary)]" />
                <span>Joined {user.createdAt ? formatDate(user.createdAt.toDate()) : 'Recently'}</span>
              </div>
            </div>
          </div>
        </Card>
      </FadeIn>

      {/* My Listings */}
      <SlideUp delay={0.1}>
        <h2 className="text-lg font-display font-black text-[var(--text-primary)] mb-4 uppercase tracking-tight">My Listings</h2>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-[var(--color-primary-600)]" />
          </div>
        ) : userListings.length > 0 ? (
          <div className="space-y-3">
            {userListings.map((listing) => (
              <Card key={listing.id} hover padding="md" className="border-2 border-[var(--border-default)]">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
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
                    <h3 className="font-bold text-[var(--text-primary)] text-lg mb-2">{listing.title}</h3>
                    <div className="flex flex-wrap gap-1">
                      {listing.tags.map((tag) => (
                        <Badge key={tag} variant="outline" size="sm">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="ml-4"
                    onClick={() => navigate(ROUTES.editListing(listing.id))}
                  >
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
      </SlideUp>

      {/* Account Settings Preview */}
      <SlideUp delay={0.2}>
        <Card padding="lg" className="border-2 border-[var(--border-default)]">
          <h2 className="text-lg font-display font-black text-[var(--text-primary)] mb-4 uppercase tracking-tight">Account</h2>
          <div className="space-y-4">
            {/* Google Calendar Integration */}
            <div className="flex items-center justify-between py-2 border-b-2 border-[var(--border-default)]">
              <div className="flex items-center gap-3">
                {calendarLinked ? (
                  <CalendarCheck className="h-5 w-5 text-green-600" />
                ) : (
                  <CalendarX className="h-5 w-5 text-[var(--text-tertiary)]" />
                )}
                <div>
                  <p className="font-bold text-[var(--text-primary)]">Google Calendar</p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {calendarLinked 
                      ? 'Sessions will automatically sync to your calendar' 
                      : 'Connect to sync sessions automatically'}
                  </p>
                </div>
              </div>
              {calendarLinked ? (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleDisconnectCalendar}
                  disabled={calendarLoading}
                  leftIcon={calendarLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
                >
                  Disconnect
                </Button>
              ) : (
                <Button 
                  size="sm"
                  onClick={handleConnectCalendar}
                  disabled={calendarLoading}
                  leftIcon={calendarLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
                >
                  Connect
                </Button>
              )}
            </div>

            <div className="flex items-center justify-between py-2 border-b-2 border-[var(--border-default)]">
              <div className="flex items-center gap-3">
                <Bell className={`h-5 w-5 ${emailEnabled ? 'text-blue-600' : 'text-[var(--text-tertiary)]'}`} />
                <div>
                  <p className="font-bold text-[var(--text-primary)]">Email Notifications</p>
                  <p className="text-sm text-[var(--text-secondary)]">Receive updates about matches and messages</p>
                </div>
              </div>
              <Button 
                variant={emailEnabled ? 'primary' : 'outline'} 
                size="sm"
                onClick={handleToggleEmail}
              >
                {emailEnabled ? 'Enabled' : 'Disabled'}
              </Button>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                {privacyMode === 'public' ? (
                  <Globe className="h-5 w-5 text-green-600" />
                ) : (
                  <Lock className="h-5 w-5 text-orange-600" />
                )}
                <div>
                  <p className="font-bold text-[var(--text-primary)]">Privacy Settings</p>
                  <p className="text-sm text-[var(--text-secondary)]">Control who can see your profile</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleTogglePrivacy}
              >
                {privacyMode === 'public' ? 'Public' : 'Users Only'}
              </Button>
            </div>
          </div>
        </Card>
      </SlideUp>
    </div>
  );
}
