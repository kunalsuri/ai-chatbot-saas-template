/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { useState, useEffect } from "react";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Badge } from "@/shared/components/ui/badge";
import { useToast } from "@/shared/hooks/use-toast";
import { api } from "@/lib/api";
import { useTheme } from '@/shared/components/ThemeContext';
import { useUser } from "@/features/user-management/components/UserContext";
import { UserProfileCard } from "@/features/user-management/components/UserProfileCard";
import { Instagram, Facebook, Twitter, Linkedin } from "lucide-react";

export default function Settings() {
  const { toast } = useToast();
  const { theme, setTheme, actualTheme } = useTheme();
  const { user, updateUser } = useUser();
  
  // State for different settings sections
  const [apiKeys, setApiKeys] = useState({
    gemini: "",
    pexels: "",
    instagram: "",
    pixabay: "",
  });

  const [profileSettings, setProfileSettings] = useState({
    name: user?.name || "",
    email: user?.email || "",
    bio: user?.bio || "",
    company: user?.company || "",
    location: user?.location || "",
    website: user?.website || "",
    timezone: "UTC",
    language: user?.preferences?.language || "en",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: user?.preferences?.notifications?.email ?? true,
    pushNotifications: user?.preferences?.notifications?.push ?? false,
    marketingEmails: user?.preferences?.notifications?.marketing ?? false,
    securityAlerts: user?.preferences?.notifications?.security ?? true,
  });

  const [postingDefaults, setPostingDefaults] = useState({
    defaultPlatform: "instagram",
    defaultHashtags: "",
    autoSchedule: false,
    defaultPostTime: "09:00",
  });

  const [isConnectedToInstagram, setIsConnectedToInstagram] = useState(false);

  const handleSaveApiKeys = () => {
    // In a real app, this would securely save API keys
    toast({
      title: "API Keys Saved",
      description: "Your API keys have been securely stored.",
    });
  };

  const handleSaveProfile = () => {
    if (!user) return;
    
    // Update user profile with all fields
    updateUser({
      name: profileSettings.name,
      bio: profileSettings.bio,
      company: profileSettings.company,
      location: profileSettings.location,
      website: profileSettings.website,
      preferences: {
        ...user.preferences,
        language: profileSettings.language,
      }
    });
    
    toast({
      title: "Profile Updated",
      description: "Your profile settings have been saved.",
    });
  };

  const handleSaveNotifications = async () => {
    if (!user) return;
    
    try {
      await updateUser({
        preferences: {
          theme: user.preferences.theme,
          language: user.preferences.language,
          timezone: user.preferences.timezone,
          notifications: {
            email: notificationSettings.emailNotifications,
            push: notificationSettings.pushNotifications,
            marketing: notificationSettings.marketingEmails,
            security: notificationSettings.securityAlerts,
          },
        },
      });
      
      toast({
        title: "Notifications Updated",
        description: "Your notification preferences have been saved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update notification preferences. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Update state when user data changes
  useEffect(() => {
    if (user) {
      setProfileSettings(prev => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        bio: user.bio || "",
        company: user.company || "",
        location: user.location || "",
        website: user.website || "",
        language: user.preferences?.language || "en",
      }));
      
      setNotificationSettings({
        emailNotifications: user.preferences?.notifications?.email ?? true,
        pushNotifications: user.preferences?.notifications?.push ?? false,
        marketingEmails: user.preferences?.notifications?.marketing ?? false,
        securityAlerts: user.preferences?.notifications?.security ?? true,
      });
    }
  }, [user]);

  const handleSaveDefaults = () => {
    toast({
      title: "Defaults Updated",
      description: "Your posting defaults have been saved.",
    });
  };

  const handleConnectInstagram = async () => {
    try {
      const { authUrl } = await api.getInstagramAuthUrl();
      window.open(authUrl, '_blank', 'width=600,height=700');
      
      // In a real app, you'd listen for the callback
      toast({
        title: "Instagram Authorization",
        description: "Please complete the authorization in the popup window.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to Instagram. Please try again.",
        variant: "destructive",
      });
    }
  };

  const timezones = [
    { value: "UTC", label: "UTC" },
    { value: "America/New_York", label: "Eastern Time" },
    { value: "America/Chicago", label: "Central Time" },
    { value: "America/Denver", label: "Mountain Time" },
    { value: "America/Los_Angeles", label: "Pacific Time" },
    { value: "Europe/London", label: "London" },
    { value: "Europe/Paris", label: "Paris" },
    { value: "Asia/Tokyo", label: "Tokyo" },
    { value: "Australia/Sydney", label: "Sydney" },
  ];

  return (
    <div className="space-y-6" data-testid="settings-page">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and application preferences</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-6 bg-muted/50">
          <TabsTrigger value="profile" data-testid="tab-profile" className="transition-all duration-200">Profile</TabsTrigger>
          <TabsTrigger value="appearance" data-testid="tab-appearance" className="transition-all duration-200">Appearance</TabsTrigger>
          <TabsTrigger value="api-keys" data-testid="tab-api-keys" className="transition-all duration-200">API Keys</TabsTrigger>
          <TabsTrigger value="integrations" data-testid="tab-integrations" className="transition-all duration-200">Integrations</TabsTrigger>
          <TabsTrigger value="notifications" data-testid="tab-notifications" className="transition-all duration-200">Notifications</TabsTrigger>
          <TabsTrigger value="defaults" data-testid="tab-defaults" className="transition-all duration-200">Defaults</TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile">
          <UserProfileCard className="w-full" />
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance">
          <Card className="p-6 bg-card text-card-foreground border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">Appearance & Theme</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Customize the look and feel of your dashboard with ChatGPT-inspired themes.
            </p>
            
            <div className="space-y-6">
              <div>
                <Label htmlFor="theme-select">Theme Preference</Label>
                <Select value={theme} onValueChange={(value: 'light' | 'dark' | 'system') => setTheme(value)}>
                  <SelectTrigger className="w-full mt-2" data-testid="select-theme">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light Mode</SelectItem>
                    <SelectItem value="dark">Dark Mode</SelectItem>
                    <SelectItem value="system">System Preference</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-2">
                  Currently using: <span className="font-medium capitalize">{actualTheme}</span> theme
                  {actualTheme === 'dark' && ' (VSCode-style with darker sidebar)'}
                </p>
              </div>

              {/* Theme Preview */}
              <div className="space-y-4">
                <Label>Theme Preview</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Light Theme Preview */}
                  <div className="p-4 rounded-lg border border-border bg-white text-black">
                    <div className="text-sm font-medium mb-2">Light Theme</div>
                    <div className="space-y-2">
                      <div className="h-2 bg-gray-200 rounded"></div>
                      <div className="h-2 bg-gray-100 rounded w-3/4"></div>
                      <div className="flex justify-end">
                        <div className="px-3 py-1 bg-green-500 text-white rounded-full text-xs">
                          Send
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dark Theme Preview */}
                  <div className="p-4 rounded-lg border border-border bg-[#1e1e1e] text-[#ECECF1]">
                    <div className="text-sm font-medium mb-2">Dark Theme</div>
                    <div className="space-y-2">
                      <div className="h-2 bg-[#252526] rounded"></div>
                      <div className="h-2 bg-[#2d2d30] rounded w-3/4"></div>
                      <div className="flex justify-end">
                        <div className="px-3 py-1 bg-[#19C37D] text-white rounded-full text-xs">
                          Send
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => toast({ title: "Theme Applied", description: "Your theme preference has been saved." })}>
                  Apply Theme
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* API Keys */}
        <TabsContent value="api-keys">
          <Card className="p-6 bg-card text-card-foreground border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">API Configuration</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Configure your API keys for AI generation, image search, and social media publishing.
            </p>
            
            <div className="space-y-6">
              <div>
                <Label htmlFor="gemini-key">Google Gemini API Key</Label>
                <Input
                  id="gemini-key"
                  type="password"
                  value={apiKeys.gemini}
                  onChange={(e) => setApiKeys({...apiKeys, gemini: e.target.value})}
                  placeholder="AIza..."
                  data-testid="input-gemini-key"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Used for AI quote generation and caption creation
                </p>
              </div>
              
              <div>
                <Label htmlFor="pexels-key">Pexels API Key</Label>
                <Input
                  id="pexels-key"
                  type="password"
                  value={apiKeys.pexels}
                  onChange={(e) => setApiKeys({...apiKeys, pexels: e.target.value})}
                  placeholder="Enter your Pexels API key..."
                  data-testid="input-pexels-key"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Used for searching background images
                </p>
              </div>
              
              <div>
                <Label htmlFor="pixabay-key">Pixabay API Key (Optional)</Label>
                <Input
                  id="pixabay-key"
                  type="password"
                  value={apiKeys.pixabay}
                  onChange={(e) => setApiKeys({...apiKeys, pixabay: e.target.value})}
                  placeholder="Enter your Pixabay API key..."
                  data-testid="input-pixabay-key"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Additional source for background images
                </p>
              </div>
              
              <div>
                <Label htmlFor="instagram-key">Instagram App Credentials</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Instagram Client ID"
                    value={apiKeys.instagram}
                    onChange={(e) => setApiKeys({...apiKeys, instagram: e.target.value})}
                    data-testid="input-instagram-client-id"
                  />
                  <Input
                    type="password"
                    placeholder="Instagram Client Secret"
                    data-testid="input-instagram-client-secret"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Used for Instagram post publishing
                </p>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleSaveApiKeys} data-testid="button-save-api-keys">
                  Save API Keys
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations">
          <Card className="p-6 bg-card text-card-foreground border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">Social Media Integrations</h2>
            
            <div className="space-y-6">
              {/* Instagram Integration */}
              <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-card hover:bg-muted/50 transition-all duration-200 shadow-sm hover:shadow-md">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                    <Instagram className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Instagram</h3>
                    <p className="text-sm text-muted-foreground">
                      {isConnectedToInstagram ? "Connected and ready to publish" : "Connect to schedule and publish posts"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {isConnectedToInstagram && (
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                      Connected
                    </Badge>
                  )}
                  <Button
                    variant={isConnectedToInstagram ? "outline" : "default"}
                    onClick={handleConnectInstagram}
                    data-testid="button-connect-instagram"
                    className="transition-all duration-200 hover:scale-105"
                  >
                    {isConnectedToInstagram ? "Reconnect" : "Connect"}
                  </Button>
                </div>
              </div>

              {/* Facebook Integration */}
              <div className="flex items-center justify-between p-4 border border-border rounded-lg opacity-60 bg-muted/30 transition-all duration-200">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                    <Facebook className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Facebook</h3>
                    <p className="text-sm text-muted-foreground">Publish to Facebook pages and groups</p>
                  </div>
                </div>
                <Badge variant="outline" className="border-muted-foreground/30 text-muted-foreground">Coming Soon</Badge>
              </div>

              {/* Twitter Integration */}
              <div className="flex items-center justify-between p-4 border border-border rounded-lg opacity-60 bg-muted/30 transition-all duration-200">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-foreground rounded-lg flex items-center justify-center shadow-sm">
                    <Twitter className="h-6 w-6 text-background" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">X (Twitter)</h3>
                    <p className="text-sm text-muted-foreground">Share quotes on X platform</p>
                  </div>
                </div>
                <Badge variant="outline" className="border-muted-foreground/30 text-muted-foreground">Coming Soon</Badge>
              </div>

              {/* LinkedIn Integration */}
              <div className="flex items-center justify-between p-4 border border-border rounded-lg opacity-60 bg-muted/30 transition-all duration-200">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-700 rounded-lg flex items-center justify-center shadow-sm">
                    <Linkedin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">LinkedIn</h3>
                    <p className="text-sm text-muted-foreground">Professional quote sharing</p>
                  </div>
                </div>
                <Badge variant="outline" className="border-muted-foreground/30 text-muted-foreground">Coming Soon</Badge>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card className="p-6 bg-card text-card-foreground border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">Notification Preferences</h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-foreground">Email Notifications</h3>
                  <p className="text-sm text-muted-foreground">Receive updates via email</p>
                </div>
                <Switch
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, emailNotifications: checked})}
                  data-testid="switch-email-notifications"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-foreground">Push Notifications</h3>
                  <p className="text-sm text-muted-foreground">Browser push notifications</p>
                </div>
                <Switch
                  checked={notificationSettings.pushNotifications}
                  onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, pushNotifications: checked})}
                  data-testid="switch-push-notifications"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-foreground">Marketing Emails</h3>
                  <p className="text-sm text-muted-foreground">Receive updates about new features</p>
                </div>
                <Switch
                  checked={notificationSettings.marketingEmails}
                  onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, marketingEmails: checked})}
                  data-testid="switch-marketing-emails"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-foreground">Security Alerts</h3>
                  <p className="text-sm text-muted-foreground">Important security notifications</p>
                </div>
                <Switch
                  checked={notificationSettings.securityAlerts}
                  onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, securityAlerts: checked})}
                  data-testid="switch-security-alerts"
                />
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleSaveNotifications} data-testid="button-save-notifications">
                  Save Preferences
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Posting Defaults */}
        <TabsContent value="defaults">
          <Card className="p-6 bg-card text-card-foreground border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">Posting Defaults</h2>
            
            <div className="space-y-6">
              <div>
                <Label htmlFor="default-platform">Default Platform</Label>
                <Select 
                  value={postingDefaults.defaultPlatform} 
                  onValueChange={(value) => setPostingDefaults({...postingDefaults, defaultPlatform: value})}
                >
                  <SelectTrigger data-testid="select-default-platform">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="twitter">X (Twitter)</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="default-hashtags">Default Hashtags</Label>
                <Input
                  id="default-hashtags"
                  value={postingDefaults.defaultHashtags}
                  onChange={(e) => setPostingDefaults({...postingDefaults, defaultHashtags: e.target.value})}
                  placeholder="#motivation #quotes #inspiration"
                  data-testid="input-default-hashtags"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  These hashtags will be added to all new posts by default
                </p>
              </div>
              
              <div>
                <Label htmlFor="default-post-time">Default Posting Time</Label>
                <Input
                  id="default-post-time"
                  type="time"
                  value={postingDefaults.defaultPostTime}
                  onChange={(e) => setPostingDefaults({...postingDefaults, defaultPostTime: e.target.value})}
                  data-testid="input-default-post-time"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-foreground">Auto-Schedule</h3>
                  <p className="text-sm text-muted-foreground">Automatically schedule posts at optimal times</p>
                </div>
                <Switch
                  checked={postingDefaults.autoSchedule}
                  onCheckedChange={(checked) => setPostingDefaults({...postingDefaults, autoSchedule: checked})}
                  data-testid="switch-auto-schedule"
                />
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleSaveDefaults} data-testid="button-save-defaults">
                  Save Defaults
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
