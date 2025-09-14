/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { useState, useEffect, useCallback } from 'react';
import { promptImproverApi, PromptImprovementHistoryItem } from '../api/prompt-improver-api';

export type PromptImproverHistoryItem = PromptImprovementHistoryItem;

interface UsePromptImproverHistoryReturn {
  history: PromptImproverHistoryItem[];
  isLoading: boolean;
  loadImprovementHistory: () => Promise<void>;
  deleteImprovement: (id: string) => Promise<void>;
  addImprovement: (item: Omit<PromptImproverHistoryItem, 'id' | 'timestamp'>) => Promise<void>;
  clearHistory: () => Promise<void>;
  deleteConfirmation: {
    isOpen: boolean;
    promptText: string;
    timestamp: string;
    isLoading: boolean;
  };
  openDeleteConfirmation: (item: PromptImproverHistoryItem) => void;
  closeDeleteConfirmation: () => void;
  confirmDeleteImprovement: () => Promise<void>;
}

export function usePromptImproverHistory(): UsePromptImproverHistoryReturn {
  const [history, setHistory] = useState<PromptImproverHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    promptText: '',
    timestamp: '',
    isLoading: false
  });
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Load history from server API on mount
  useEffect(() => {
    const loadHistory = async () => {
      setIsLoading(true);
      try {
        console.log('Loading prompt improver history from server API...');
        const serverHistory = await promptImproverApi.getHistory();
        console.log('Loaded prompt improver history from server:', serverHistory);
        setHistory(serverHistory);
      } catch (error) {
        console.error('Failed to load prompt improver history from server:', error);
        // Fallback to localStorage if server fails
        try {
          const stored = localStorage.getItem('prompt-improver-history');
          console.log('Falling back to localStorage:', stored);
          if (stored) {
            const parsed = JSON.parse(stored);
            console.log('Parsed prompt improver history from localStorage:', parsed);
            setHistory(parsed);
          } else {
            console.log('No prompt improver history found in localStorage');
            setHistory([]);
          }
        } catch (localError) {
          console.error('Failed to load from localStorage too:', localError);
          setHistory([]);
        }
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };
    loadHistory();
  }, []);

  // Save history to localStorage whenever it changes (but not on initial load)
  useEffect(() => {
    if (!isInitialized) return;
    
    try {
      console.log('Saving prompt improver history to localStorage:', history);
      localStorage.setItem('prompt-improver-history', JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save prompt improver history:', error);
    }
  }, [history, isInitialized]);

  const loadImprovementHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log('Reloading prompt improver history from server API...');
      const serverHistory = await promptImproverApi.getHistory();
      console.log('Reloaded prompt improver history from server:', serverHistory);
      setHistory(serverHistory);
    } catch (error) {
      console.error('Failed to reload prompt improver history from server:', error);
      // Fallback to localStorage if server fails
      try {
        const stored = localStorage.getItem('prompt-improver-history');
        console.log('Falling back to localStorage:', stored);
        if (stored) {
          const parsed = JSON.parse(stored);
          console.log('Parsed prompt improver history from localStorage:', parsed);
          setHistory(parsed);
        }
      } catch (localError) {
        console.error('Failed to load from localStorage too:', localError);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addImprovement = async (item: Omit<PromptImproverHistoryItem, 'id' | 'timestamp'>) => {
    try {
      console.log('Adding new prompt improvement to server:', item);
      const savedItem = await promptImproverApi.save(item);
      console.log('Prompt improvement saved to server:', savedItem);
      
      // Reload the entire history from server to ensure we have the latest data
      console.log('Reloading history after save...');
      await loadImprovementHistory();
    } catch (error) {
      console.error('Failed to save prompt improvement to server:', error);
      // Fallback to local-only storage
      const newItem: PromptImproverHistoryItem = {
        ...item,
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString()
      };

      console.log('Adding new prompt improvement locally only:', newItem);
      setHistory(prev => {
        const newHistory = [newItem, ...prev];
        console.log('Updated prompt improver history (local only):', newHistory);
        return newHistory;
      });
      throw error; // Re-throw so the UI can handle the error
    }
  };

  const deleteImprovement = async (id: string) => {
    try {
      console.log('Deleting prompt improvement from server:', id);
      await promptImproverApi.delete(id);
      console.log('Prompt improvement deleted from server successfully');
      
      // Reload the entire history from server to ensure we have the latest data
      console.log('Reloading history after delete...');
      await loadImprovementHistory();
    } catch (error) {
      console.error('Failed to delete prompt improvement from server:', error);
      // Still update local state even if server delete fails
      setHistory(prev => prev.filter(item => item.id !== id));
      throw error; // Re-throw so the UI can handle the error
    }
  };

  const clearHistory = async () => {
    setHistory([]);
  };

  const openDeleteConfirmation = (item: PromptImproverHistoryItem) => {
    setItemToDelete(item.id);
    setDeleteConfirmation({
      isOpen: true,
      promptText: item.original,
      timestamp: item.timestamp,
      isLoading: false
    });
  };

  const closeDeleteConfirmation = () => {
    setDeleteConfirmation({
      isOpen: false,
      promptText: '',
      timestamp: '',
      isLoading: false
    });
    setItemToDelete(null);
  };

  const confirmDeleteImprovement = async () => {
    if (!itemToDelete) return;
    
    setDeleteConfirmation(prev => ({ ...prev, isLoading: true }));
    
    try {
      await deleteImprovement(itemToDelete);
      closeDeleteConfirmation();
    } catch (error) {
      console.error('Failed to delete item:', error);
    } finally {
      setDeleteConfirmation(prev => ({ ...prev, isLoading: false }));
    }
  };

  return {
    history,
    isLoading,
    loadImprovementHistory,
    deleteImprovement,
    addImprovement,
    clearHistory,
    deleteConfirmation,
    openDeleteConfirmation,
    closeDeleteConfirmation,
    confirmDeleteImprovement
  };
}