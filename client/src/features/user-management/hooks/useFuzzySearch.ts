/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { useMemo } from 'react';
import Fuse from 'fuse.js';
import { CompleteUser } from '../types/user-management';

interface FuzzySearchOptions {
  threshold?: number;
  includeScore?: boolean;
  includeMatches?: boolean;
  minMatchCharLength?: number;
}

/**
 * Custom hook for fuzzy search functionality
 * Provides intelligent search across user data
 */
export function useFuzzySearch(
  users: CompleteUser[],
  searchQuery: string,
  options: FuzzySearchOptions = {}
) {
  const {
    threshold = 0.3,
    includeScore = true,
    includeMatches = true,
    minMatchCharLength = 2,
  } = options;

  const fuse = useMemo(() => {
    const fuseOptions = {
      keys: [
        { name: 'username', weight: 0.3 },
        { name: 'email', weight: 0.3 },
        { name: 'name', weight: 0.2 },
        { name: 'role', weight: 0.1 },
        { name: 'plan', weight: 0.1 },
      ],
      threshold,
      includeScore,
      includeMatches,
      minMatchCharLength,
      ignoreLocation: true,
      findAllMatches: true,
    };

    return new Fuse(users, fuseOptions);
  }, [users, threshold, includeScore, includeMatches, minMatchCharLength]);

  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.length < minMatchCharLength) {
      return users.map(user => ({ item: user, score: 0, matches: [] }));
    }

    return fuse.search(searchQuery);
  }, [fuse, searchQuery, users, minMatchCharLength]);

  const filteredUsers = useMemo(() => {
    return searchResults.map(result => result.item);
  }, [searchResults]);

  const highlightedResults = useMemo(() => {
    return searchResults.map(result => ({
      user: result.item,
      score: result.score || 0,
      matches: result.matches || [],
      highlights: getHighlights(result),
    }));
  }, [searchResults]);

  return {
    filteredUsers,
    searchResults: highlightedResults,
    hasResults: filteredUsers.length > 0,
    resultCount: filteredUsers.length,
  };
}

/**
 * Extract highlighted text segments from Fuse.js matches
 */
function getHighlights(result: any) {
  if (!result.matches) return {};

  const highlights: Record<string, string[]> = {};

  result.matches.forEach((match: any) => {
    const { key, value, indices } = match;
    if (!value || !indices) return;

    const highlighted: string[] = [];
    let lastIndex = 0;

    indices.forEach(([start, end]: [number, number]) => {
      // Add text before match
      if (start > lastIndex) {
        highlighted.push(value.substring(lastIndex, start));
      }
      
      // Add highlighted match
      highlighted.push(`<mark>${value.substring(start, end + 1)}</mark>`);
      lastIndex = end + 1;
    });

    // Add remaining text
    if (lastIndex < value.length) {
      highlighted.push(value.substring(lastIndex));
    }

    highlights[key] = highlighted;
  });

  return highlights;
}

/**
 * Hook for saved search filters
 */
export function useSavedSearches() {
  const STORAGE_KEY = 'user-management-saved-searches';

  const getSavedSearches = (): Array<{ name: string; query: string; filters: any }> => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };

  const saveSearch = (name: string, query: string, filters: any) => {
    const saved = getSavedSearches();
    const newSearch = { name, query, filters, createdAt: new Date().toISOString() };
    const updated = [...saved.filter(s => s.name !== name), newSearch];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const deleteSearch = (name: string) => {
    const saved = getSavedSearches();
    const updated = saved.filter(s => s.name !== name);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return {
    savedSearches: getSavedSearches(),
    saveSearch,
    deleteSearch,
  };
}