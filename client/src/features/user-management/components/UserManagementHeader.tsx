/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import React from 'react';
import { Button } from '@/shared/components/ui/button';
import { Plus } from 'lucide-react';

interface UserManagementHeaderProps {
  wsConnected: boolean;
  showAnalytics: boolean;
  onToggleAnalytics: () => void;
  onCreateUser: () => void;
}

export const UserManagementHeader = React.memo<UserManagementHeaderProps>(({
  wsConnected,
  showAnalytics,
  onToggleAnalytics,
  onCreateUser,
}) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <div className="flex items-center gap-2 mt-1">
          <div className={`h-2 w-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-muted-foreground">
            {wsConnected ? 'Real-time updates active' : 'Offline mode'}
          </span>
        </div>
      </div>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          onClick={onToggleAnalytics}
        >
          {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
        </Button>
        <Button onClick={onCreateUser}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>
    </div>
  );
});