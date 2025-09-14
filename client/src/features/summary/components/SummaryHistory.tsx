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
import { SummaryHistoryItem } from '../types';
import { useSummaryHistory } from '../hooks/useSummaryHistory';

interface SummaryHistoryProps {
  onSelect?: (summary: SummaryHistoryItem) => void;
  selectedItem?: SummaryHistoryItem | null;
  onClose?: () => void;
  className?: string;
}

export function SummaryHistory({
  onSelect,
  selectedItem,
  onClose,
  className = ""
}: SummaryHistoryProps) {
  const { 
    history, 
    isLoading, 
    deleteSummary
  } = useSummaryHistory();

  // Handle delete action
  const handleDelete = async (id: string): Promise<void> => {
    await deleteSummary(id);
    return Promise.resolve();
  };

  const renderSummaryItem = (item: SummaryHistoryItem) => {
    return (
      <Card className="border-0 shadow-none bg-transparent hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer">
        <CardContent className="p-0 space-y-2">
          <div className="flex justify-between items-start">
            <div className="flex space-x-2">
              <Badge variant="outline">{item.model}</Badge>
              {item.tokens > 0 && (
                <Badge variant="secondary">{item.tokens} tokens</Badge>
              )}
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
            <p className="font-medium text-muted-foreground mb-1">{item.originalText}</p>
            <p className="text-foreground">{item.summary}</p>
          </div>
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>
              {item.timestamp && formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <HistoryList
      title="Summary History"
      items={history}
      renderItem={renderSummaryItem}
      onItemSelect={onSelect}
      onItemDelete={handleDelete}
      selectedItemId={selectedItem?.id}
      emptyMessage="No summary history found"
      isLoading={isLoading}
      onClose={onClose}
      className={className}
    />
  );
}