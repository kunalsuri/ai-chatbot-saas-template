/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import React from 'react';
import { DeleteConfirmationDialog } from './delete-confirmation-dialog';
import { formatDistanceToNow } from 'date-fns';

interface TranslationDeleteConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  translationText: string;
  timestamp: Date | null;
  isLoading?: boolean;
}

export function TranslationDeleteConfirmation({
  isOpen,
  onClose,
  onConfirm,
  translationText,
  timestamp,
  isLoading = false
}: TranslationDeleteConfirmationProps) {
  const itemDetails = timestamp 
    ? `Original text: "${translationText.length > 50 ? translationText.substring(0, 50) + '...' : translationText}" • Created ${formatDistanceToNow(timestamp, { addSuffix: true })}`
    : `Original text: "${translationText.length > 50 ? translationText.substring(0, 50) + '...' : translationText}"`;
  
  return (
    <DeleteConfirmationDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Delete Translation"
      description="Are you sure you want to delete this translation? This action cannot be undone."
      itemName="Translation"
      itemDetails={itemDetails}
      isLoading={isLoading}
    />
  );
};
