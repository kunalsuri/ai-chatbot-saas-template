/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import React from 'react';
import { HistoryList } from '@/shared/components/ui/HistoryList';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { Trash2, Copy, Check } from 'lucide-react';
import { usePromptImproverHistory, type PromptImproverHistoryItem } from '../hooks/usePromptImproverHistory';

interface PromptImproverHistoryProps {
  onSelect?: (improvement: PromptImproverHistoryItem) => void;
  onDelete?: (id: string) => Promise<void>;
  selectedItem?: PromptImproverHistoryItem | null;
  onClose?: () => void;
  className?: string;
}

export function PromptImproverHistory({
  onSelect,
  onDelete,
  selectedItem,
  onClose,
  className = ""
}: PromptImproverHistoryProps) {
  const { 
    history, 
    isLoading, 
    deleteConfirmation,
    openDeleteConfirmation,
    closeDeleteConfirmation,
    confirmDeleteImprovement
  } = usePromptImproverHistory();
  
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  // Handle delete action - opens confirmation dialog
  const handleDelete = async (id: string): Promise<void> => {
    if (onDelete) {
      return onDelete(id);
    } else {
      const improvementToDelete = history.find(item => item.id === id);
      if (improvementToDelete) {
        openDeleteConfirmation(improvementToDelete);
      }
      return Promise.resolve();
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderImprovementItem = (item: PromptImprovementHistoryItem) => {
    return (
      <Card className="border-0 shadow-none bg-transparent hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer">
        <CardContent className="p-0 space-y-2">
          <div className="flex justify-between items-start">
            <div className="flex space-x-2">
              <Badge variant="outline">{item.provider}</Badge>
              <Badge variant="outline">{item.model}</Badge>
            </div>
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(item.improved, item.id);
                }}
              >
                {copiedId === item.id ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <div className="text-sm">
            <p className="font-medium">{item.original.substring(0, 60)}{item.original.length > 60 ? '...' : ''}</p>
            <p className="text-muted-foreground">{item.improved.substring(0, 60)}{item.improved.length > 60 ? '...' : ''}</p>
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
        title="Prompt Improvement History"
        items={history}
        renderItem={renderImprovementItem}
        onItemSelect={onSelect}
        onItemDelete={handleDelete}
        selectedItemId={selectedItem?.id}
        emptyMessage="No prompt improvement history found"
        isLoading={isLoading}
        onClose={onClose}
        className={className}
      />
    </>
  );
}

export default PromptImproverHistory;
