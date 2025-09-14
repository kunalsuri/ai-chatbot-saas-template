/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Badge } from '@/shared/components/ui/badge';
import { UserActivity } from '@shared/types/user-activity';

// Define the ActivityItem type for this component
export interface ActivityItem {
  id: string;
  type: string;
  timestamp: string;
  description: string;
  metadata?: Record<string, any>;
}

// Utility function to transform UserActivity data into ActivityItem format
export const transformUserActivityToItems = (activity: UserActivity | undefined): ActivityItem[] => {
  if (!activity) return [];
  
  const items: ActivityItem[] = [];
  
  // Add login activity
  if (activity.lastLogin) {
    items.push({
      id: `login-${Date.now()}`,
      type: 'login',
      timestamp: activity.lastLogin,
      description: `User logged in (${activity.totalLogins} total logins)`,
      metadata: {
        totalLogins: activity.totalLogins,
        averageSessionDuration: `${Math.round(activity.averageSessionDuration / 60)} minutes`
      }
    });
  }
  
  // Add feature usage activities
  Object.entries(activity.featuresUsed).forEach(([feature, data]) => {
    if (data) {
      items.push({
        id: `feature-${feature}-${Date.now()}`,
        type: 'feature-usage',
        timestamp: data.lastUsed,
        description: `Used ${feature} feature`,
        metadata: {
          count: data.count,
          feature: feature
        }
      });
    }
  });
  
  // Add API request activities
  if (activity.apiRequests && activity.apiRequests.total > 0) {
    items.push({
      id: `api-${Date.now()}`,
      type: 'api-usage',
      timestamp: activity.lastLogin || new Date().toISOString(),
      description: `API usage summary`,
      metadata: {
        totalRequests: activity.apiRequests.total,
        byEndpoint: activity.apiRequests.byEndpoint
      }
    });
  }
  
  return items.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

interface UserActivityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  username: string;
  activities: ActivityItem[] | undefined;
  isLoading: boolean;
}

export function UserActivityDialog({
  isOpen,
  onClose,
  userId,
  username,
  activities: activityData,
  isLoading
}: UserActivityDialogProps) {
  // Transform the activity data if needed
  const activities = Array.isArray(activityData) ? activityData : transformUserActivityToItems(activityData as unknown as UserActivity);
  const getActivityTypeColor = (type: string) => {
    const colorMap: Record<string, string> = {
      login: 'bg-green-100 text-green-800',
      logout: 'bg-blue-100 text-blue-800',
      'password-change': 'bg-amber-100 text-amber-800',
      'settings-update': 'bg-purple-100 text-purple-800',
      'chat-session': 'bg-indigo-100 text-indigo-800',
      'prompt-improvement': 'bg-pink-100 text-pink-800',
      'translation': 'bg-cyan-100 text-cyan-800',
      default: 'bg-gray-100 text-gray-800'
    };
    
    return colorMap[type] || colorMap.default;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Activity History for {username}</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : !activities || activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No activity recorded for this user.
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {activities.map((activity) => (
                <div 
                  key={activity.id} 
                  className="border rounded-lg p-4 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-2">
                    <Badge className={getActivityTypeColor(activity.type)}>
                      {activity.type.replace('-', ' ')}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleString()}
                    </span>
                  </div>
                  
                  <p className="text-sm mb-2">{activity.description}</p>
                  
                  {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                    <div className="mt-2 bg-muted/50 p-2 rounded-md">
                      <p className="text-xs font-medium mb-1">Additional Details:</p>
                      <div className="text-xs">
                        {Object.entries(activity.metadata).map(([key, value]) => (
                          <div key={key} className="grid grid-cols-3 gap-2">
                            <span className="font-medium">{key}:</span>
                            <span className="col-span-2 truncate">
                              {typeof value === 'object' 
                                ? JSON.stringify(value) 
                                : String(value)
                              }
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
