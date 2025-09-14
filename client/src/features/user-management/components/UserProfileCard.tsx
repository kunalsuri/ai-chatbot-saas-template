/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

/**
 * Modern User Profile Card - State-of-the-Art React/TypeScript 2025
 * Beautiful, accessible, and reactive user profile component
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Switch } from '@/shared/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Separator } from '@/shared/components/ui/separator';
import { toast } from 'sonner';
import {
  User,
  Mail,
  Phone,
  Building,
  MapPin,
  Globe,
  Save,
  X,
  Edit3,
  Shield,
  Bell,
  Palette,
  Languages,
  Eye,
  EyeOff,
  Clock,
  Calendar,
  Camera,
  Cat,
  Image as ImageIcon,
} from 'lucide-react';
import { useCurrentUser, useUserPreferences, useUserAvatar, useUserActivity } from "@/features/user-management/hooks/useUserManagement";
import { AnimalAvatarSelector } from './AnimalAvatarSelector';
import { CompleteUser, UpdateUserProfile, SessionUser } from '@/features/user-management';
import { cn } from '@/lib/utils';

interface UserProfileCardProps {
  className?: string;
  showEditButton?: boolean;
  compact?: boolean;
}

export function UserProfileCard({
  className,
  showEditButton = true,
  compact = false
}: UserProfileCardProps) {
  const { user, updateProfile, updatePreferences, isUpdatingProfile } = useCurrentUser();
  const { preferences, updateTheme, updateLanguage, updateNotifications } = useUserPreferences();
  const { avatar, uploadAvatar, removeAvatar, isUploading } = useUserAvatar();
  const { activity, isLoading: isLoadingActivity } = useUserActivity(user?.id);
  const [avatarSelectorOpen, setAvatarSelectorOpen] = useState(false);

  // Function to determine if the avatar URL is an animal avatar
  const isAnimalAvatar = (url: string | null) => {
    return url?.includes('/assets/avatars/') || false;
  };

  // Get avatar type for display
  const avatarType = avatar ? (isAnimalAvatar(avatar) ? 'animal' : 'custom') : 'none';

  // Handle animal avatar selection
  const handleAnimalAvatarSelect = (avatarUrl: string) => {
    // Update profile with the selected avatar URL
    updateProfile({ avatar: avatarUrl });
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<UpdateUserProfile>>({});

  if (!user) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardHeader className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-muted rounded-full" />
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-32" />
              <div className="h-3 bg-muted rounded w-24" />
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  const handleEdit = () => {
    setEditData({
      name: user.name || '',
      bio: user.bio || '',
      location: user.location || '',
      website: user.website || '',
      company: user.company || '',
      role: user.role || 'free_user',
      status: user.status || 'active',
      avatar: user.avatar || '',
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await updateProfile(editData);
      setIsEditing(false);
      setEditData({});
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({});
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size must be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      uploadAvatar(file);
    }
  };

  const getPlanBadgeVariant = (plan: string) => {
    switch (plan) {
      case 'premium':
      case 'enterprise':
        return 'default';
      case 'pro':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getUserInitials = (user: SessionUser) => {
    if (user.name) {
      return user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user.username.slice(0, 2).toUpperCase();
  };

  if (compact) {
    return (
      <>
        <AnimalAvatarSelector
          open={avatarSelectorOpen}
          onOpenChange={setAvatarSelectorOpen}
          onSelect={handleAnimalAvatarSelect}
          currentAvatar={avatar || undefined}
        />
        <Card className={className}>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={avatar || undefined} alt={user.name || user.username} />
                <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user.name || user.username}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
              <Badge variant={getPlanBadgeVariant(user.plan)} className="text-xs">
                {user.plan}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <Card className={cn("w-full max-w-2xl", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className="h-16 w-16">
                <AvatarImage src={avatar || undefined} alt={user.name || user.username} />
                <AvatarFallback className="text-lg">
                  {getUserInitials(user)}
                </AvatarFallback>
              </Avatar>
              {avatar && (
                <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1 shadow-sm border border-background" title={avatarType === 'animal' ? 'Animal Avatar' : 'Custom Avatar'}>
                  {avatarType === 'animal' ? (
                    <Cat className="h-3 w-3" />
                  ) : (
                    <ImageIcon className="h-3 w-3" />
                  )}
                </div>
              )}
              {isEditing && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center gap-2">
                  <label htmlFor="avatar-upload" className="cursor-pointer p-1 hover:bg-black/30 rounded-full" title="Upload custom avatar">
                    <Camera className="h-5 w-5 text-white" />
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                      disabled={isUploading}
                    />
                  </label>
                  <button
                    type="button"
                    className="p-1 hover:bg-black/30 rounded-full"
                    title="Choose animal avatar"
                    onClick={() => setAvatarSelectorOpen(true)}
                  >
                    <Cat className="h-5 w-5 text-white" />
                  </button>
                </div>
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                </div>
              )}
            </div>

            <div className="space-y-1">
              {isEditing ? (
                <Input
                  value={editData.name || ''}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  placeholder="Full name"
                  className="text-lg font-semibold"
                />
              ) : (
                <h2 className="text-lg font-semibold">
                  {user.name || user.username}
                </h2>
              )}

              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{user.email}</span>
                {user.emailVerified && (
                  <Shield className="h-4 w-4 text-green-500" aria-label="Verified" />
                )}
              </div>

              <div className="flex items-center space-x-2 flex-wrap">
                <Badge variant={getPlanBadgeVariant(user.plan)}>
                  {user.plan}
                </Badge>
                <Badge
                  variant={user.status === 'active' ? 'default' : user.status === 'suspended' ? 'destructive' : 'secondary'}
                  className="text-xs"
                >
                  {user.status}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Calendar className="h-3 w-3 mr-1" />
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </Badge>
              </div>
            </div>
          </div>

          {showEditButton && (
            <div className="flex space-x-2">
              {isEditing ? (
                <>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={isUpdatingProfile}
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancel}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button size="sm" variant="outline" onClick={handleEdit}>
                  <Edit3 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4 mt-4">
            {/* Bio Section */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              {isEditing ? (
                <Textarea
                  id="bio"
                  value={editData.bio || ''}
                  onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows={3}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  {user.bio || 'No bio provided'}
                </p>
              )}
            </div>

            <Separator />

            {/* Profile Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Account Status</Label>
                {isEditing ? (
                  <Select
                    value={editData.status || 'active'}
                    onValueChange={(value: 'active' | 'inactive' | 'suspended') =>
                      setEditData({ ...editData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex items-center space-x-2 text-sm">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="capitalize">{user.status || 'active'}</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                {isEditing ? (
                  <Input
                    id="role"
                    value={editData.role || ''}
                    onChange={(e) => setEditData({ ...editData, role: e.target.value as "admin" | "pro_user" | "free_user" | undefined })}
                    placeholder="Your role"
                  />
                ) : (
                  <div className="flex items-center space-x-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{user.role || 'Not specified'}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                {isEditing ? (
                  <Input
                    id="company"
                    value={editData.company || ''}
                    onChange={(e) => setEditData({ ...editData, company: e.target.value })}
                    placeholder="Company name"
                  />
                ) : (
                  <div className="flex items-center space-x-2 text-sm">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span>{user.company || 'Not specified'}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                {isEditing ? (
                  <Input
                    id="location"
                    value={editData.location || ''}
                    onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                    placeholder="Your location"
                  />
                ) : (
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{user.location || 'Not specified'}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                {isEditing ? (
                  <Input
                    id="website"
                    type="url"
                    value={editData.website || ''}
                    onChange={(e) => setEditData({ ...editData, website: e.target.value })}
                    placeholder="https://your-website.com"
                  />
                ) : (
                  <div className="flex items-center space-x-2 text-sm">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    {user.website ? (
                      <a
                        href={user.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {user.website}
                      </a>
                    ) : (
                      <span>Not specified</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-4 mt-4">
            {/* Theme Settings */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Palette className="h-4 w-4" />
                <Label>Theme</Label>
              </div>
              <Select
                value={preferences?.theme || 'system'}
                onValueChange={(value: 'light' | 'dark' | 'system') => updateTheme(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Timezone Settings */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <Label>Timezone</Label>
              </div>
              <Select
                value={preferences?.timezone || 'UTC'}
                onValueChange={(value) => updatePreferences({ timezone: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  <SelectItem value="America/Chicago">Central Time</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                  <SelectItem value="Europe/London">London</SelectItem>
                  <SelectItem value="Europe/Paris">Paris</SelectItem>
                  <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Language Settings */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Languages className="h-4 w-4" />
                <Label>Language</Label>
              </div>
              <Select
                value={preferences?.language || 'en'}
                onValueChange={updateLanguage}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Notification Settings */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Bell className="h-4 w-4" />
                <Label>Notifications</Label>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-normal">Email notifications</Label>
                    <p className="text-xs text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={preferences?.notifications?.email ?? false}
                    onCheckedChange={(checked) => updateNotifications({ email: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-normal">Push notifications</Label>
                    <p className="text-xs text-muted-foreground">
                      Receive push notifications in browser
                    </p>
                  </div>
                  <Switch
                    checked={preferences?.notifications?.push ?? false}
                    onCheckedChange={(checked) => updateNotifications({ push: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-normal">Marketing emails</Label>
                    <p className="text-xs text-muted-foreground">
                      Receive updates about new features
                    </p>
                  </div>
                  <Switch
                    checked={preferences?.notifications?.marketing ?? false}
                    onCheckedChange={(checked) => updateNotifications({ marketing: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-normal">Security alerts</Label>
                    <p className="text-xs text-muted-foreground">
                      Important security notifications
                    </p>
                  </div>
                  <Switch
                    checked={preferences?.notifications?.security ?? true}
                    onCheckedChange={(checked) => updateNotifications({ security: checked })}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Privacy Settings */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4" />
                <Label>Privacy Settings</Label>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-normal">Profile visibility</Label>
                    <p className="text-xs text-muted-foreground">
                      Control who can see your profile
                    </p>
                  </div>
                  <Select
                    value={preferences?.privacy?.profileVisibility || 'public'}
                    onValueChange={(value: 'public' | 'private' | 'friends') =>
                      updatePreferences({
                        privacy: {
                          profileVisibility: value,
                          showEmail: preferences?.privacy?.showEmail ?? false,
                          showActivity: preferences?.privacy?.showActivity ?? true
                        }
                      })
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="friends">Friends</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-normal">Show email</Label>
                    <p className="text-xs text-muted-foreground">
                      Display email on public profile
                    </p>
                  </div>
                  <Switch
                    checked={preferences?.privacy?.showEmail ?? false}
                    onCheckedChange={(checked) =>
                      updatePreferences({
                        privacy: {
                          profileVisibility: preferences?.privacy?.profileVisibility ?? 'public',
                          showEmail: checked,
                          showActivity: preferences?.privacy?.showActivity ?? true
                        }
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-normal">Show activity</Label>
                    <p className="text-xs text-muted-foreground">
                      Display activity status
                    </p>
                  </div>
                  <Switch
                    checked={preferences?.privacy?.showActivity ?? true}
                    onCheckedChange={(checked) =>
                      updatePreferences({
                        privacy: {
                          profileVisibility: preferences?.privacy?.profileVisibility ?? 'public',
                          showEmail: preferences?.privacy?.showEmail ?? false,
                          showActivity: checked
                        }
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4 mt-4">
            {isLoadingActivity ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : activity ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center space-y-1">
                    <p className="text-2xl font-bold">{activity.totalLogins || 0}</p>
                    <p className="text-xs text-muted-foreground">Total Logins</p>
                  </div>

                  <div className="text-center space-y-1">
                    <p className="text-2xl font-bold">{activity.totalSessions || 0}</p>
                    <p className="text-xs text-muted-foreground">Sessions</p>
                  </div>

                  <div className="text-center space-y-1">
                    <p className="text-2xl font-bold">{activity.apiRequests?.total || 0}</p>
                    <p className="text-xs text-muted-foreground">API Requests</p>
                  </div>

                  <div className="text-center space-y-1">
                    <p className="text-2xl font-bold">{Object.keys(activity.featuresUsed || {}).length || 0}</p>
                    <p className="text-xs text-muted-foreground">Features Used</p>
                  </div>
                </div>

                {/* Plan Information */}
                <Separator />
                <div className="space-y-3">
                  <Label>Subscription Details</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Current Plan</span>
                        <Badge variant={getPlanBadgeVariant(user.plan)}>{user.plan}</Badge>
                      </div>
                      {user.planStartDate && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Plan Start</span>
                          <span className="text-sm">{new Date(user.planStartDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      {user.planEndDate && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Plan End</span>
                          <span className="text-sm">{new Date(user.planEndDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      {user.isTrialing && user.trialEndDate && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Trial Ends</span>
                          <span className="text-sm text-orange-600">{new Date(user.trialEndDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Total API Requests</span>
                        <span className="text-sm">{activity?.apiRequests?.total || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Average Session</span>
                        <span className="text-sm">
                          {activity?.averageSessionDuration
                            ? `${Math.round(activity.averageSessionDuration / 60)} min`
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Total Sessions</span>
                        <span className="text-sm">{activity?.totalSessions || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Most Used Features */}
                {Object.keys(activity.featuresUsed || {}).length > 0 && (
                  <div className="space-y-3">
                    <Label>Most Used Features</Label>
                    <div className="space-y-2">
                      {Object.entries(activity.featuresUsed || {})
                        .sort(([, a], [, b]) => ((b as any).count || 0) - ((a as any).count || 0))
                        .slice(0, 3)
                        .map(([name, data]) => (
                          <div key={name} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="capitalize">
                                {name === 'promptImprover' ? 'Prompt Improver' :
                                  name === 'localLLMs' ? 'Local LLMs' :
                                    name.charAt(0).toUpperCase() + name.slice(1)}
                              </Badge>
                            </div>
                            <div className="text-sm">{(data as any).count || 0} uses</div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Recent Activity */}
                <div className="space-y-3">
                  <Label>Recent Activity</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Last Login</span>
                      </div>
                      <span className="text-sm">
                        {activity.lastLogin
                          ? new Date(activity.lastLogin).toLocaleString()
                          : 'Never'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Average Session</span>
                      </div>
                      <span className="text-sm">
                        {activity.averageSessionDuration
                          ? `${Math.round(activity.averageSessionDuration / 60)} minutes`
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No activity data available</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
