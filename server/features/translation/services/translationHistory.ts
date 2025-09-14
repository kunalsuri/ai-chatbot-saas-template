/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { TranslationHistoryItem } from '../types/api';

const TRANSLATION_HISTORY_FILE = path.join(process.cwd(), 'data', 'translation_history.json');

// Ensure the translation history file exists
if (!fs.existsSync(TRANSLATION_HISTORY_FILE)) {
  fs.writeFileSync(TRANSLATION_HISTORY_FILE, JSON.stringify({ translations: [] }, null, 2));
}

export class TranslationHistoryService {
  private history: TranslationHistoryItem[] = [];

  constructor() {
    this.loadHistory();
  }

  public loadHistory(): void {
    try {
      const data = fs.readFileSync(TRANSLATION_HISTORY_FILE, 'utf8');
      const parsedData = JSON.parse(data);
      this.history = parsedData.translations.map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp)
      }));
    } catch (error) {
      console.error('Error loading translation history:', error);
      this.history = [];
    }
  }

  private saveHistory(): void {
    try {
      const data = JSON.stringify({ translations: this.history }, null, 2);
      fs.writeFileSync(TRANSLATION_HISTORY_FILE, data);
    } catch (error) {
      console.error('Error saving translation history:', error);
    }
  }

  public getHistory(userId?: string): TranslationHistoryItem[] {
    if (userId) {
      return this.history.filter(item => item.userId === userId);
    }
    return this.history;
  }

  public addTranslation(translation: Omit<TranslationHistoryItem, 'id' | 'timestamp'>): TranslationHistoryItem {
    // Make sure we have the latest history
    this.loadHistory();
    
    // Normalize input for comparison
    const normalizedOriginal = translation.original.trim();
    const normalizedTranslated = translation.translated.trim();
    
    // Check if a duplicate translation already exists
    const isDuplicate = this.history.some(item => 
      item.original.trim() === normalizedOriginal && 
      item.translated.trim() === normalizedTranslated && 
      item.sourceLang === translation.sourceLang && 
      item.targetLang === translation.targetLang
    );

    // If duplicate exists, return the existing translation
    if (isDuplicate) {
      console.log('Duplicate translation found, skipping save');
      const existingTranslation = this.history.find(item => 
        item.original.trim() === normalizedOriginal && 
        item.translated.trim() === normalizedTranslated && 
        item.sourceLang === translation.sourceLang && 
        item.targetLang === translation.targetLang
      );
      
      if (existingTranslation) {
        return existingTranslation;
      }
    }

    // Create and save new translation if not a duplicate
    const newTranslation: TranslationHistoryItem = {
      id: uuidv4(),
      ...translation,
      timestamp: new Date()
    };

    this.history.unshift(newTranslation);
    this.saveHistory();
    return newTranslation;
  }

  public deleteTranslation(id: string, userId?: string): boolean {
    const initialLength = this.history.length;
    
    if (userId) {
      this.history = this.history.filter(item => !(item.id === id && item.userId === userId));
    } else {
      this.history = this.history.filter(item => item.id !== id);
    }

    if (this.history.length !== initialLength) {
      this.saveHistory();
      return true;
    }
    
    return false;
  }

  public getTranslationById(id: string): TranslationHistoryItem | undefined {
    return this.history.find(item => item.id === id);
  }
}

export default new TranslationHistoryService();
