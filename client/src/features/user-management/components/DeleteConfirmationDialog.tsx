/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import React from 'react';
import { Button } from '@/shared/components/ui/button';

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  username: string;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmationDialog = React.memo<DeleteConfirmationDialogProps>(({
  isOpen,
  username,
  isDeleting,
  onCancel,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background p-6 rounded-lg shadow-lg max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Delete User</h3>
        <p>
          Are you sure you want to delete user <strong>{username}</strong>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2 mt-6">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>
    </div>
  );
});