/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { useState, useEffect, useCallback } from 'react';
import { SummaryHistoryItem } from '../types';
import { summaryApi } from '../api/summary-api';

export type { SummaryHistoryItem };

interface UseSummaryHistoryReturn {
  history: SummaryHistoryItem[];
  isLoading: boolean;
  loadSummaryHistory: () => Promise<void>;
  deleteSummary: (id: string) => Promise<void>;
  addSummary: (summary: Omit<SummaryHistoryItem, 'id' | 'timestamp'>) => Promise<void>;
  clearHistory: () => Promise<void>;
}

export function useSummaryHistory(): UseSummaryHistoryReturn {
  const [history, setHistory] = useState<SummaryHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load history from server API on mount
  useEffect(() => {
    const loadHistory = async () => {
      setIsLoading(true);
      try {
        console.log('Loading summary history from server API...');
        const serverHistory = await summaryApi.getHistory();
        console.log('Loaded summary history from server:', serverHistory);
        setHistory(serverHistory);
      } catch (error) {
        console.error('Failed to load summary history from server:', error);
        // Fallback to localStorage if server fails
        try {
          const stored = localStorage.getItem('summary-history');
          console.log('Falling back to localStorage:', stored);
          if (stored) {
            const parsed = JSON.parse(stored);
            console.log('Parsed summary history from localStorage:', parsed);
            setHistory(parsed);
          } else {
            console.log('No summary history found in localStorage');
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
      console.log('Saving summary history to localStorage:', history);
      localStorage.setItem('summary-history', JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save summary history:', error);
    }
  }, [history, isInitialized]);

  const loadSummaryHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log('Reloading summary history from server API...');
      const serverHistory = await summaryApi.getHistory();
      console.log('Reloaded summary history from server:', serverHistory);
      setHistory(serverHistory);
    } catch (error) {
      console.error('Failed to reload summary history from server:', error);
      // Fallback to localStorage if server fails
      try {
        const stored = localStorage.getItem('summary-history');
        console.log('Falling back to localStorage:', stored);
        if (stored) {
          const parsed = JSON.parse(stored);
          console.log('Parsed summary history from localStorage:', parsed);
          setHistory(parsed);
        }
      } catch (localError) {
        console.error('Failed to load from localStorage too:', localError);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addSummary = async (summary: Omit<SummaryHistoryItem, 'id' | 'timestamp'>) => {
    try {
      console.log('Adding new summary to server:', summary);
      const savedSummary = await summaryApi.save(summary);
      console.log('Summary saved to server:', savedSummary);

      // Reload the entire history from server to ensure we have the latest data
      console.log('Reloading history after save...');
      await loadSummaryHistory();
    } catch (error) {
      console.error('Failed to save summary to server:', error);
      // Fallback to local-only storage
      const newSummary: SummaryHistoryItem = {
        ...summary,
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString()
      };

      console.log('Adding new summary locally only:', newSummary);
      setHistory(prev => {
        const newHistory = [newSummary, ...prev];
        console.log('Updated summary history (local only):', newHistory);
        return newHistory;
      });
      throw error; // Re-throw so the UI can handle the error
    }
  };

  const deleteSummary = async (id: string) => {
    try {
      console.log('Deleting summary from server:', id);
      await summaryApi.delete(id);
      console.log('Summary deleted from server successfully');

      // Reload the entire history from server to ensure we have the latest data
      console.log('Reloading history after delete...');
      await loadSummaryHistory();
    } catch (error) {
      console.error('Failed to delete summary from server:', error);
      // Still update local state even if server delete fails
      setHistory(prev => prev.filter(item => item.id !== id));
      throw error; // Re-throw so the UI can handle the error
    }
  };

  const clearHistory = async () => {
    setHistory([]);
  };

  return {
    history,
    isLoading,
    loadSummaryHistory,
    deleteSummary,
    addSummary,
    clearHistory
  };
}