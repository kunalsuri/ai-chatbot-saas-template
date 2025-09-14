/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { usePromptImproverHistory } from '@/contexts/PromptImproverHistoryContext';

export function PromptImproverDeleteConfirmation() {
  const {
    deleteConfirmation: {
      isOpen,
      improvementText,
      timestamp,
      isLoading,
    },
    closeDeleteConfirmation,
    confirmDeleteImprovement,
  } = usePromptImproverHistory();

  return (
    <Dialog open={isOpen} onOpenChange={closeDeleteConfirmation}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Prompt Improvement</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this prompt improvement? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-2 py-4">
          <div className="rounded-md bg-muted/50 p-3 text-sm">
            <p className="line-clamp-2">{improvementText}</p>
            {timestamp && (
              <p className="mt-1 text-xs text-muted-foreground">
                Created {format(new Date(timestamp), 'MMM d, yyyy')}
              </p>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={closeDeleteConfirmation}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={confirmDeleteImprovement}
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default PromptImproverDeleteConfirmation;
