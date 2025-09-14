/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { useState, useEffect, useCallback } from 'react';
import { TranslationHistoryItem } from '../types';
import { translationApi } from '../api/translation-api';

interface UseTranslationHistoryReturn {
  history: TranslationHistoryItem[];
  isLoading: boolean;
  loadTranslationHistory: () => Promise<void>;
  addTranslation: (translation: Omit<TranslationHistoryItem, 'id' | 'timestamp'>) => Promise<void>;
  deleteTranslation: (id: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  deleteConfirmation: {
    isOpen: boolean;
    translationText: string;
    timestamp: string;
    isLoading: boolean;
  };
  openDeleteConfirmation: (translation: TranslationHistoryItem) => void;
  closeDeleteConfirmation: () => void;
  confirmDeleteTranslation: () => Promise<void>;
}

export function useTranslationHistory(): UseTranslationHistoryReturn {
  const [history, setHistory] = useState<TranslationHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    translationText: '',
    timestamp: '',
    isLoading: false,
    itemToDelete: null as TranslationHistoryItem | null
  });

  // Load history from server API on mount
  useEffect(() => {
    const loadHistory = async () => {
      setIsLoading(true);
      try {
        console.log('Loading translation history from server API...');
        const serverHistory = await translationApi.getHistory();
        console.log('Loaded translation history from server:', serverHistory);
        setHistory(serverHistory);
      } catch (error) {
        console.error('Failed to load translation history from server:', error);
        // Fallback to localStorage if server fails
        try {
          const stored = localStorage.getItem('translation-history');
          console.log('Falling back to localStorage:', stored);
          if (stored) {
            const parsed = JSON.parse(stored);
            console.log('Parsed translation history from localStorage:', parsed);
            setHistory(parsed);
          } else {
            console.log('No translation history found in localStorage');
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
      console.log('Saving translation history to localStorage:', history);
      localStorage.setItem('translation-history', JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save translation history:', error);
    }
  }, [history, isInitialized]);

  const loadTranslationHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log('Reloading translation history from server API...');
      const serverHistory = await translationApi.getHistory();
      console.log('Reloaded translation history from server:', serverHistory);
      setHistory(serverHistory);
    } catch (error) {
      console.error('Failed to reload translation history from server:', error);
      // Fallback to localStorage if server fails
      try {
        const stored = localStorage.getItem('translation-history');
        console.log('Falling back to localStorage:', stored);
        if (stored) {
          const parsed = JSON.parse(stored);
          console.log('Parsed translation history from localStorage:', parsed);
          setHistory(parsed);
        }
      } catch (localError) {
        console.error('Failed to load from localStorage too:', localError);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addTranslation = async (translation: Omit<TranslationHistoryItem, 'id' | 'timestamp'>) => {
    try {
      console.log('Adding new translation to server:', translation);
      const savedTranslation = await translationApi.save(translation);
      console.log('Translation saved to server:', savedTranslation);
      
      // Reload the entire history from server to ensure we have the latest data
      console.log('Reloading history after save...');
      await loadTranslationHistory();
    } catch (error) {
      console.error('Failed to save translation to server:', error);
      // Fallback to local-only storage
      const newTranslation: TranslationHistoryItem = {
        ...translation,
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString()
      };

      console.log('Adding new translation locally only:', newTranslation);
      setHistory(prev => {
        const newHistory = [newTranslation, ...prev];
        console.log('Updated translation history (local only):', newHistory);
        return newHistory;
      });
      throw error; // Re-throw so the UI can handle the error
    }
  };

  const deleteTranslation = async (id: string) => {
    try {
      console.log('Deleting translation from server:', id);
      await translationApi.delete(id);
      console.log('Translation deleted from server successfully');
      
      // Reload the entire history from server to ensure we have the latest data
      console.log('Reloading history after delete...');
      await loadTranslationHistory();
    } catch (error) {
      console.error('Failed to delete translation from server:', error);
      // Still update local state even if server delete fails
      setHistory(prev => prev.filter(item => item.id !== id));
      throw error; // Re-throw so the UI can handle the error
    }
  };

  const clearHistory = async () => {
    setHistory([]);
  };

  const openDeleteConfirmation = (translation: TranslationHistoryItem) => {
    setDeleteConfirmation({
      isOpen: true,
      translationText: translation.original,
      timestamp: translation.timestamp,
      isLoading: false,
      itemToDelete: translation
    });
  };

  const closeDeleteConfirmation = () => {
    setDeleteConfirmation(prev => ({
      ...prev,
      isOpen: false,
      itemToDelete: null
    }));
  };

  const confirmDeleteTranslation = async () => {
    if (!deleteConfirmation.itemToDelete) return;

    setDeleteConfirmation(prev => ({ ...prev, isLoading: true }));
    
    try {
      await deleteTranslation(deleteConfirmation.itemToDelete.id);
      closeDeleteConfirmation();
    } catch (error) {
      console.error('Failed to delete translation:', error);
    } finally {
      setDeleteConfirmation(prev => ({ ...prev, isLoading: false }));
    }
  };

  return {
    history,
    isLoading,
    loadTranslationHistory,
    addTranslation,
    deleteTranslation,
    clearHistory,
    deleteConfirmation: {
      isOpen: deleteConfirmation.isOpen,
      translationText: deleteConfirmation.translationText,
      timestamp: deleteConfirmation.timestamp,
      isLoading: deleteConfirmation.isLoading
    },
    openDeleteConfirmation,
    closeDeleteConfirmation,
    confirmDeleteTranslation
  };
}