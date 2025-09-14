/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/lib/utils';

interface UserManagementErrorStateProps {
  error: Error | null;
  isLoading: boolean;
  onRetry: () => void;
  onRefreshPage: () => void;
}

export const UserManagementErrorState = React.memo<UserManagementErrorStateProps>(({
  error,
  isLoading,
  onRetry,
  onRefreshPage,
}) => {
  return (
    <div className="container mx-auto p-6">
      <div className="bg-destructive/20 p-4 rounded-md">
        <h2 className="text-lg font-semibold text-destructive">Error loading users</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {error?.message || 'Please try refreshing the page or contact support if the issue persists.'}
        </p>
        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            onClick={onRetry}
            disabled={isLoading}
          >
            <RefreshCw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} />
            {isLoading ? 'Retrying...' : 'Retry'}
          </Button>
          <Button
            variant="outline"
            onClick={onRefreshPage}
          >
            Refresh Page
          </Button>
        </div>
      </div>
    </div>
  );
});