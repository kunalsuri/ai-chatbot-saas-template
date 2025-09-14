/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

// Feature-specific API imports
export { dashboardApi } from '../../features/dashboard/api/dashboard-api';
export { quotesApi } from '../../features/content/api/quotes-api';
export { imagesApi } from '../../features/content/api/images-api';
export { postsApi } from '../../features/content/api/posts-api';
export { captionsApi } from '../../features/content/api/captions-api';
export { templatesApi } from '../../features/templates/api/templates-api';
export { instagramApi } from '../../features/social/api/instagram-api';
export { translationApi } from '../../features/translation/api/translation-api';
export { ollamaApi } from '../../features/model-management/api/ollama-api';
export { lmStudioApi } from '../../features/model-management/api/lmstudio-api';
export { promptImproverApi } from '../../features/prompt-improver/api/prompt-improver-api';
export { summaryApi } from '../../features/summary/api/summary-api';

// Legacy compatibility - consolidated API object for backward compatibility
import { dashboardApi } from '@/features/dashboard/api/dashboard-api';
import { quotesApi } from '@/features/content/api/quotes-api';
import { imagesApi } from '@/features/content/api/images-api';
import { postsApi } from '@/features/content/api/posts-api';
import { captionsApi } from '@/features/content/api/captions-api';
import { templatesApi } from '@/features/templates';
import { instagramApi } from '@/features/social/api/instagram-api';
import { translationApi } from '@/features/translation/api/translation-api';
import { ollamaApi } from '@/features/model-management/api/ollama-api';
import { lmStudioApi } from '@/features/model-management/api/lmstudio-api';
import { promptImproverApi } from '@/features/prompt-improver/api/prompt-improver-api';
import { summaryApi } from '@/features/summary/api/summary-api';

/**
 * @deprecated Use feature-specific APIs instead (e.g., dashboardApi, quotesApi, etc.)
 * This consolidated API object is provided for backward compatibility only.
 */
export const api = {
  // Dashboard
  getDashboardStats: dashboardApi.getDashboardStats,
  getRecentPosts: dashboardApi.getRecentPosts,

  // Quotes
  generateQuote: quotesApi.generateQuote,
  generateCustomQuoteOllama: quotesApi.generateCustomQuoteOllama,
  generateQuoteOllama: quotesApi.generateQuoteOllama,

  // Images
  searchImages: imagesApi.searchImages,
  getCuratedImages: imagesApi.getCuratedImages,
  searchPixabayImages: imagesApi.searchPixabayImages,
  getImageCategories: imagesApi.getImageCategories,

  // Posts
  createPost: postsApi.createPost,
  schedulePost: postsApi.schedulePost,
  publishPost: postsApi.publishPost,

  // Templates
  getTemplates: templatesApi.getTemplates,
  getPopularTemplates: templatesApi.getPopularTemplates,
  getExampleTemplates: templatesApi.getExampleTemplates,

  // Captions
  generateCaption: captionsApi.generateCaption,

  // Instagram
  getInstagramAuthUrl: instagramApi.getInstagramAuthUrl,

  // Ollama
  checkOllamaHealth: ollamaApi.checkHealth,
  getOllamaModels: ollamaApi.getModels,
  testOllamaConnection: ollamaApi.testConnection,

  // LM Studio
  checkLMStudioHealth: lmStudioApi.checkHealth,
  getLMStudioModels: lmStudioApi.getModels,
  testLMStudioConnection: lmStudioApi.testConnection,
  loadLMStudioModel: lmStudioApi.loadModel,
  unloadLMStudioModel: lmStudioApi.unloadModel,

  // Translation History
  getTranslationHistory: translationApi.getTranslationHistory,
  getTranslationById: translationApi.getTranslationById,
  saveTranslation: translationApi.saveTranslation,
  deleteTranslation: translationApi.deleteTranslation,

  // Prompt Improvement
  getPromptImprovementHistory: promptImproverApi.getHistory,
  getPromptImprovementById: promptImproverApi.getById,
  savePromptImprovement: promptImproverApi.save,
  deletePromptImprovement: promptImproverApi.delete,
  improvePrompt: promptImproverApi.improve,

  // Summary functionality
  getSummaryHistory: summaryApi.getHistory,
  getSummaryById: summaryApi.getById,
  saveSummary: summaryApi.save,
  deleteSummary: summaryApi.delete,
  generateSummary: summaryApi.generate,
};
