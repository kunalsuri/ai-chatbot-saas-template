/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import { UserActivitySchema, UserActivity, FeaturesUsed, UserActivityRecord, UserActivities } from '../../../../shared/types/user-activity';

const USER_ACTIVITY_FILE = path.join(process.cwd(), 'data', 'user-activity.json');

/**
 * User Activity Service - Tracks and manages user activity data
 */
export class UserActivityService {
  private activities: UserActivities;

  constructor() {
    this.activities = this.loadActivities();
  }

  /**
   * Load activities from the JSON file
   */
  private loadActivities(): UserActivities {
    try {
      if (fs.existsSync(USER_ACTIVITY_FILE)) {
        const data = fs.readFileSync(USER_ACTIVITY_FILE, 'utf-8');
        return JSON.parse(data) as UserActivities;
      }
    } catch (error) {
      console.error('Error loading user activities:', error);
    }
    
    // Return default structure if file doesn't exist or has errors
    return { users: [] };
  }

  /**
   * Save activities to the JSON file
   */
  private saveActivities(): void {
    try {
      fs.writeFileSync(USER_ACTIVITY_FILE, JSON.stringify(this.activities, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error saving user activities:', error);
    }
  }

  /**
   * Get user activity by user ID
   */
  getUserActivity(userId: string): UserActivity | null {
    const userRecord = this.activities.users.find(user => user.userId === userId);
    return userRecord?.activity || null;
  }

  /**
   * Get all user activities
   */
  getAllUserActivities(): UserActivityRecord[] {
    return this.activities.users;
  }

  /**
   * Create or update user activity
   */
  updateUserActivity(userId: string, activity: Partial<UserActivity>): UserActivity {
    const userIndex = this.activities.users.findIndex(user => user.userId === userId);
    
    if (userIndex >= 0) {
      // Update existing user activity
      this.activities.users[userIndex].activity = {
        ...this.activities.users[userIndex].activity,
        ...activity
      };
    } else {
      // Create new user activity
      const newUserActivity: UserActivityRecord = {
        userId,
        activity: {
          totalLogins: activity.totalLogins || 0,
          lastLogin: activity.lastLogin,
          totalSessions: activity.totalSessions || 0,
          averageSessionDuration: activity.averageSessionDuration || 0,
          apiRequests: activity.apiRequests || { total: 0, byEndpoint: {} },
          featuresUsed: activity.featuresUsed || {},
          weeklyActivity: activity.weeklyActivity || []
        }
      };
      
      this.activities.users.push(newUserActivity);
    }
    
    this.saveActivities();
    return this.getUserActivity(userId)!;
  }

  /**
   * Track a user login
   */
  trackLogin(userId: string): void {
    const userActivity = this.getUserActivity(userId);
    const now = new Date().toISOString();
    
    if (userActivity) {
      this.updateUserActivity(userId, {
        totalLogins: userActivity.totalLogins + 1,
        lastLogin: now,
        totalSessions: userActivity.totalSessions + 1
      });
    } else {
      this.updateUserActivity(userId, {
        totalLogins: 1,
        lastLogin: now,
        totalSessions: 1
      });
    }
    
    this.updateWeeklyActivity(userId, 'logins');
  }

  /**
   * Track an API request
   */
  trackApiRequest(userId: string, endpoint: string): void {
    const userActivity = this.getUserActivity(userId);
    
    if (userActivity) {
      const apiRequests = { ...userActivity.apiRequests };
      apiRequests.total = (apiRequests.total || 0) + 1;
      
      if (!apiRequests.byEndpoint) {
        apiRequests.byEndpoint = {};
      }
      
      apiRequests.byEndpoint[endpoint] = (apiRequests.byEndpoint[endpoint] || 0) + 1;
      
      this.updateUserActivity(userId, { apiRequests });
    } else {
      const apiRequests = {
        total: 1,
        byEndpoint: { [endpoint]: 1 }
      };
      
      this.updateUserActivity(userId, { apiRequests });
    }
    
    this.updateWeeklyActivity(userId, 'apiCalls');
  }

  /**
   * Track feature usage
   */
  trackFeatureUsage(userId: string, feature: string): void {
    const userActivity = this.getUserActivity(userId);
    const now = new Date().toISOString();
    
    if (userActivity) {
      const featuresUsed = { ...userActivity.featuresUsed } as Record<string, { count: number, lastUsed: string }>;
      
      if (!featuresUsed[feature]) {
        featuresUsed[feature] = { count: 0, lastUsed: now };
      }
      
      featuresUsed[feature] = {
        count: featuresUsed[feature].count + 1,
        lastUsed: now
      };
      
      this.updateUserActivity(userId, { featuresUsed: featuresUsed as FeaturesUsed });
    } else {
      // Create a properly typed featuresUsed object based on the feature name
      let featuresUsed: FeaturesUsed = {};
      
      if (feature === 'chat') {
        featuresUsed = { chat: { count: 1, lastUsed: now } };
      } else if (feature === 'translate') {
        featuresUsed = { translate: { count: 1, lastUsed: now } };
      } else if (feature === 'promptImprover') {
        featuresUsed = { promptImprover: { count: 1, lastUsed: now } };
      } else if (feature === 'localLLMs') {
        featuresUsed = { localLLMs: { count: 1, lastUsed: now } };
      } else {
        // For any other features, use a type assertion
        featuresUsed = { [feature]: { count: 1, lastUsed: now } } as unknown as FeaturesUsed;
      }
      
      this.updateUserActivity(userId, { featuresUsed });
    }
  }

  /**
   * Update weekly activity stats
   */
  private updateWeeklyActivity(userId: string, activityType: 'logins' | 'apiCalls'): void {
    const userActivity = this.getUserActivity(userId);
    
    if (!userActivity) return;
    
    const currentDate = new Date();
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const weekKey = startOfWeek.toISOString().split('T')[0];
    const weeklyActivity = [...(userActivity.weeklyActivity || [])];
    
    const weekIndex = weeklyActivity.findIndex(week => week.week === weekKey);
    
    if (weekIndex >= 0) {
      weeklyActivity[weekIndex] = {
        ...weeklyActivity[weekIndex],
        [activityType]: weeklyActivity[weekIndex][activityType] + 1
      };
    } else {
      weeklyActivity.push({
        week: weekKey,
        apiCalls: activityType === 'apiCalls' ? 1 : 0,
        logins: activityType === 'logins' ? 1 : 0
      });
    }
    
    this.updateUserActivity(userId, { weeklyActivity });
  }
}

// Export singleton instance
export const userActivityService = new UserActivityService();
