/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import React from 'react';
import { HistoryList } from '@/shared/components/ui/HistoryList';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { TranslationHistoryItem } from '../types';
import { useTranslationHistory } from '../hooks/useTranslationHistory';
import { TranslationDeleteConfirmation } from '@/shared/components/ui/translation-delete-confirmation';

interface TranslationHistoryProps {
  onSelect?: (translation: TranslationHistoryItem) => void;
  selectedItem?: TranslationHistoryItem | null;
  onClose?: () => void;
  className?: string;
}

export function TranslationHistory({
  onSelect,
  selectedItem,
  onClose,
  className = ""
}: TranslationHistoryProps) {
  const { 
    history, 
    isLoading, 
    deleteConfirmation,
    openDeleteConfirmation,
    closeDeleteConfirmation,
    confirmDeleteTranslation
  } = useTranslationHistory();

  // Handle delete action - opens confirmation dialog
  const handleDelete = async (id: string): Promise<void> => {
    const translationToDelete = history.find(item => item.id === id);
    if (translationToDelete) {
      openDeleteConfirmation(translationToDelete);
    }
    return Promise.resolve();
  };

  const renderTranslationItem = (item: TranslationHistoryItem) => {
    return (
      <Card className="border-0 shadow-none bg-transparent hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer">
        <CardContent className="p-0 space-y-2">
          <div className="flex justify-between items-start">
            <div className="flex space-x-2">
              <Badge variant="outline">{item.sourceLang}</Badge>
              <Badge variant="outline">{item.targetLang}</Badge>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 group"
              onClick={(e) => {
                e.stopPropagation(); // Prevent item selection when deleting
                handleDelete(item.id);
              }}
            >
              <Trash2 className="h-4 w-4 group-hover:text-green-500 transition-colors" />
            </Button>
          </div>
          <div className="text-sm">
            <p className="font-medium">{item.original}</p>
            <p className="text-muted-foreground">{item.translated}</p>
          </div>
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>
              {item.timestamp && formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
            </span>
            <span className="font-medium">{item.model}</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      <HistoryList
        title="Translation History"
        items={history}
        renderItem={renderTranslationItem}
        onItemSelect={onSelect}
        onItemDelete={handleDelete}
        selectedItemId={selectedItem?.id}
        emptyMessage="No translation history found"
        isLoading={isLoading}
        onClose={onClose}
        className={className}
      />
      
      {/* Delete Confirmation Dialog */}
      <TranslationDeleteConfirmation
        isOpen={deleteConfirmation.isOpen}
        onClose={closeDeleteConfirmation}
        onConfirm={confirmDeleteTranslation}
        translationText={deleteConfirmation.translationText}
        timestamp={deleteConfirmation.timestamp}
        isLoading={deleteConfirmation.isLoading}
      />
    </>
  );
}