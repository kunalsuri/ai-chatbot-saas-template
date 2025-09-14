/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import React, { useState } from 'react';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Trash2, X } from 'lucide-react';
import { useToast } from '@/shared/hooks/use-toast';

export interface HistoryItemProps {
  id: string;
  [key: string]: any;
}

export interface HistoryListProps<T extends HistoryItemProps> {
  title: string;
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  onItemSelect?: (item: T) => void;
  onItemDelete?: (itemId: string) => Promise<void>;
  selectedItemId?: string | null;
  emptyMessage?: string;
  className?: string;
  isLoading?: boolean;
  onClose?: () => void;
}

export function HistoryList<T extends HistoryItemProps>({
  title,
  items,
  renderItem,
  onItemSelect,
  onItemDelete,
  selectedItemId,
  emptyMessage = "No history items found",
  className = "",
  isLoading = false,
  onClose
}: HistoryListProps<T>) {
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onItemDelete) return;

    try {
      setDeletingId(id);
      await onItemDelete(id);
      toast({
        title: "Item deleted",
        description: "The history item has been removed",
      });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Failed to delete history item",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className={`flex flex-col h-full border-r ${className}`}>
      <div className="flex items-center justify-between p-3 border-b">
        <h2 className="text-lg font-semibold">{title}</h2>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground p-4 text-center">
            {emptyMessage}
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className={`relative rounded-md p-3 cursor-pointer hover:bg-accent/50 transition-colors ${selectedItemId === item.id ? 'bg-accent' : ''
                  }`}
                onClick={() => onItemSelect && onItemSelect(item)}
              >
                {renderItem(item)}

                {onItemDelete && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 hover:opacity-100"
                          onClick={(e) => handleDelete(item.id, e)}
                          disabled={deletingId === item.id}
                        >
                          {deletingId === item.id ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-current" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
