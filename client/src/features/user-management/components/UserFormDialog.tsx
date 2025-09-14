/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { UserForm } from './UserForm';
import { CompleteUser } from '@/features/user-management';

interface UserFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user?: CompleteUser;
  onSubmit: (data: Partial<CompleteUser>) => void;
  isLoading: boolean;
}

export function UserFormDialog({
  isOpen,
  onClose,
  user,
  onSubmit,
  isLoading
}: UserFormDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{user ? 'Edit User' : 'Create New User'}</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <UserForm 
            {...(user ? { user } : {})}
            onSubmit={onSubmit}
            onCancel={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
