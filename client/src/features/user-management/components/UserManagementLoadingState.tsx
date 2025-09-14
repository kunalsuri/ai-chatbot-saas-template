/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import React from 'react';
import { RefreshCw } from 'lucide-react';

export const UserManagementLoadingState = React.memo(() => {
  return (
    <div className="container mx-auto p-6">
      <div className="bg-background p-4 rounded-md">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <h2 className="text-lg font-semibold">Loading User Management...</h2>
        </div>
        <p className="text-sm text-muted-foreground mt-2">Fetching user data and permissions...</p>
      </div>
    </div>
  );
});