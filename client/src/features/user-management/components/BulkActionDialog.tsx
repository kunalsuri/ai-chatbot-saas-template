/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import React from 'react';
import { Button } from '@/shared/components/ui/button';

interface BulkActionDialogProps {
  isOpen: boolean;
  action: 'activate' | 'deactivate' | '';
  selectedUserCount: number;
  isProcessing: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const BulkActionDialog = React.memo<BulkActionDialogProps>(({
  isOpen,
  action,
  selectedUserCount,
  isProcessing,
  onCancel,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background p-6 rounded-lg shadow-lg max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">
          {action === 'activate' ? 'Activate Users' : 'Deactivate Users'}
        </h3>
        <p>
          Are you sure you want to {action} {selectedUserCount} selected users?
        </p>
        <div className="flex justify-end gap-2 mt-6">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            variant={action === 'activate' ? 'default' : 'secondary'}
            onClick={onConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Confirm'}
          </Button>
        </div>
      </div>
    </div>
  );
});