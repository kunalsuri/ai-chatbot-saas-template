/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ArrowLeftRight, Languages, MessageSquare, PlusCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useOllamaConfig } from '@/features/settings/hooks/useOllamaConfig';
import { useLMStudioConfig } from '@/features/settings/hooks/useLMStudioConfig';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Switch } from '@/shared/components/ui/switch';
import { Badge } from '@/shared/components/ui/badge';
import { Textarea } from '@/shared/components/ui/textarea';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { secureGet, securePost, AuthenticationError, ServerRestartError } from "@/features/auth/utils/secureApi";
import { useAuthContext } from "@/features/auth";
import { useToast } from "@/shared/hooks/use-toast";
import { LocalAIModelStatus } from '@/features/chatbot/components/ai/LocalAIModelStatus';
import { TranslationHistory } from "./TranslationHistory";
import { useTranslationHistory } from '../hooks/useTranslationHistory';
import { TranslationDeleteConfirmation } from '@/shared/components/ui/translation-delete-confirmation';
import { api } from '@/lib/api';
import { TranslationHistoryItem } from '../types';
import { TemplateSelector } from '@/shared/components/ui/TemplateSelector';

const LANGUAGES = [
  { code: 'fr', name: 'French' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
];

type AIProvider = 'ollama' | 'lmstudio';

interface ServerHealth {
  isOnline: boolean;
  models: string[];
  error?: string;
}

function TranslateLocalPage() {
  const { checkAuth } = useAuthContext();
  const { toast } = useToast();
  const { history, loadTranslationHistory, addTranslation } = useTranslationHistory();
  
  // Debug logging
  console.log('TranslateLocal - Current history:', history);
  console.log('TranslateLocal - History length:', history?.length);
  console.log('TranslateLocal - History type:', typeof history);
  const { config, connectionStatus, availableModels, isConnected } = useOllamaConfig();
  const { 
    availableModels: lmStudioModels, 
    isConnected: lmStudioConnected,
    connectionStatus: lmStudioConnectionStatus 
  } = useLMStudioConfig();
  
  const [currentModel, setCurrentModel] = useState(config.model);
  const [aiProvider, setAiProvider] = useState<AIProvider>('ollama');
  const [healthCheckLoading, setHealthCheckLoading] = useState(false);
  const [sourceLang, setSourceLang] = useState('fr');
  const [targetLang, setTargetLang] = useState('en');
  const [isCasual, setIsCasual] = useState(true);
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  
  // Function to clear textboxes and start a new translation
  const handleNewTranslation = () => {
    // Save current translation if it exists
    if (inputText.trim() && translatedText.trim()) {
      saveCurrentTranslation();
    }
    
    // Clear textboxes
    setInputText('');
    setTranslatedText('');
    setTokenCount(0);
  };
  
  // Function to save the current translation
  const saveCurrentTranslation = async () => {
    try {
      await addTranslation({
        original: inputText,
        translated: translatedText,
        sourceLang,
        targetLang,
        model: currentModel,
        tokens: tokenCount,
        userId: 'local-user'
      });
    } catch (error) {
      console.error('Failed to save translation to history:', error);
      toast({
        title: "Error",
        description: "Failed to save translation to history",
        variant: "destructive"
      });
    }
  };
  const [isTranslating, setIsTranslating] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [selectedTranslation, setSelectedTranslation] = useState<TranslationHistoryItem | null>(null);
  const [tokenCount, setTokenCount] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const getCurrentServerHealth = () => {
    return aiProvider === 'ollama' 
      ? { isOnline: isConnected, models: availableModels, error: isConnected ? undefined : connectionStatus.error }
      : { isOnline: lmStudioConnected, models: lmStudioModels, error: lmStudioConnectionStatus.error };
  };

  const getAvailableModels = () => {
    return getCurrentServerHealth().models;
  };

  const checkServerHealth = async () => {
    setHealthCheckLoading(true);
    try {
      // Health checks are now handled by the hooks automatically
      console.log('Server health check triggered');
    } catch (error) {
      console.error('Health check failed:', error);
      if (error instanceof AuthenticationError || error instanceof ServerRestartError) {
        await checkAuth();
        toast({
          title: "Authentication Required",
          description: "Please log in to continue",
          variant: "destructive"
        });
      }
    } finally {
      setHealthCheckLoading(false);
    }
  };

  const handleProviderChange = (provider: AIProvider) => {
    setAiProvider(provider);
    const models = provider === 'ollama' ? availableModels : (lmStudioModels || []);
    if (models && models.length > 0) {
      setCurrentModel(models[0] || '');
    }
  };

  const handleModelChange = (model: string) => {
    setCurrentModel(model);
  };

  const handleTranslate = async () => {
    const serverHealth = getCurrentServerHealth();
    if (!inputText.trim() || !serverHealth.isOnline) return;

    // Check for LM Studio model availability
    if (aiProvider === 'lmstudio' && (!lmStudioModels || lmStudioModels.length === 0)) {
      toast({
        title: "No Models Available",
        description: "No LM Studio models are currently loaded. Please load a model first.",
        variant: "destructive"
      });
      return;
    }

    setIsTranslating(true);
    abortControllerRef.current = new AbortController();

    try {
      // Use the selected model from state instead of hardcoded values
      if (!currentModel) {
        throw new Error(`No model selected for ${aiProvider}`);
      }
      const endpoint = aiProvider === 'ollama' ? '/api/translate' : '/api/lmstudio/translate';
      const data = await securePost(endpoint, {
        text: inputText,
        targetLang: targetLang,
        sourceLang: sourceLang,
        model: currentModel,
        isCasual,
      });

      const translation = (data as any).translation || data.data?.translation || '';
      const tokens = (data as any).tokens || data.data?.tokens || 0;
      
      setTranslatedText(translation);
      setTokenCount(tokens);

      // Save translation to history
      try {
        await addTranslation({
          original: inputText,
          translated: translation,
          sourceLang,
          targetLang,
          model: currentModel,
          tokens: tokens,
          userId: 'local-user'
        });
        
        toast({
          title: "Translation Saved",
          description: "Translation has been saved to history",
        });
      } catch (error) {
        console.error('Failed to save translation to history:', error);
        // Continue with translation even if saving to history fails
      }
    } catch (error: unknown) {
      if (error instanceof AuthenticationError || error instanceof ServerRestartError) {
        await checkAuth();
        toast({
          title: "Authentication Required",
          description: "Please log in to use the translator",
          variant: "destructive"
        });
      } else if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Translation error:', error);
        toast({
          title: "Translation Failed",
          description: error.message || "Failed to translate text",
          variant: "destructive"
        });
      }
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSwapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setInputText(translatedText);
    setTranslatedText(inputText);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleTranslate();
    }
  };

  const handleSelectTemplate = (text: string) => {
    setInputText(text);
  };

  // Removed auto-translation on input change for performance
  // Users can translate manually with Ctrl+Enter or the translate button

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    setCurrentModel(config.model);
  }, [config.model]);

  useEffect(() => {
    checkServerHealth();
  }, []);

  useEffect(() => {
    // Update current model when switching providers
    const models = aiProvider === 'ollama' ? availableModels : (lmStudioModels || []);
    if (models && models.length > 0 && !models.includes(currentModel)) {
      setCurrentModel(models[0] || '');
    }
  }, [aiProvider, availableModels, lmStudioModels, currentModel]);

  return (
    <div className="min-h-screen bg-muted/30 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
              <Languages className="w-8 h-8" />
              AI Translator
            </h1>
            <p className="text-muted-foreground">Real-time translation with local Ollama models</p>
          </div>
          <Button 
            onClick={handleNewTranslation} 
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            New Translation
          </Button>
        </div>

        {/* AI Model Status */}
        <Card className="p-6 mb-6">
          <LocalAIModelStatus
            currentProvider={aiProvider}
            currentModel={currentModel || 'No model'}
            sessionInfo="Translation history available"
            ollamaConnected={isConnected}
            ollamaModels={availableModels}
            ollamaConnectionStatus={connectionStatus.error || (connectionStatus.connected ? 'Connected' : 'Disconnected')}
            lmStudioConnected={lmStudioConnected}
            lmStudioModels={lmStudioModels || []}
            lmStudioError={lmStudioConnectionStatus.error}
            onProviderChange={handleProviderChange}
            onModelChange={handleModelChange}
            onRefresh={checkServerHealth}
            isRefreshing={healthCheckLoading}
            showProviderToggle={true}
            showModelSelect={true}
            showRefreshButton={true}
            showErrorAlert={true}
          />
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Language Configuration */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Translation Configuration</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Language Mode</label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Formal</span>
                    <Switch checked={isCasual} onCheckedChange={setIsCasual} />
                    <span className="text-sm text-muted-foreground">Casual</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Translation Interface */}
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-2 block">Source Language</label>
                    <Select value={sourceLang} onValueChange={setSourceLang}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map(lang => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleSwapLanguages}
                    className="mt-6"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                  </Button>

                  <div className="flex-1">
                    <label className="text-sm font-medium mb-2 block">Target Language</label>
                    <Select value={targetLang} onValueChange={setTargetLang}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map(lang => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Original Text</label>
                  <Textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Enter text in ${LANGUAGES.find(l => l.code === sourceLang)?.name}...`}
                    className="min-h-[120px]"
                  />
                  <TemplateSelector
                    category="translate"
                    onSelectTemplate={handleSelectTemplate}
                    className="mt-2"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-muted-foreground">
                      Press Ctrl+Enter to translate
                    </p>
                    <Button
                      onClick={handleTranslate}
                      disabled={!inputText.trim() || !getCurrentServerHealth().isOnline || isTranslating}
                      size="sm"
                    >
                      {isTranslating ? 'Translating...' : 'Translate'}
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Translated Text</label>
                  <div className="relative">
                    <Textarea
                      value={translatedText}
                      readOnly
                      className="min-h-[120px] bg-background border-border"
                      placeholder={isTranslating ? 'Translating...' : 'Translation will appear here...'}
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      {selectedTranslation && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                          {selectedTranslation.model}
                        </Badge>
                      )}
                      {tokenCount > 0 && (
                        <Badge variant="secondary">
                          {tokenCount} tokens
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Translation History */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Translation History
                </h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowHistory(!showHistory)}
                >
                  {showHistory ? 'Hide' : 'Show'}
                </Button>
              </div>
              
              {showHistory && (
                <div className="h-[600px]">
                  <TranslationHistory 
                    onSelect={(item: TranslationHistoryItem) => {
                      setSelectedTranslation(item);
                      setInputText(item.original);
                      setTranslatedText(item.translated);
                      setSourceLang(item.sourceLang);
                      setTargetLang(item.targetLang);
                      setTokenCount(item.tokens || 0);
                      
                      // Show toast with model details
                      toast({
                        title: "Translation Loaded",
                        description: `Model: ${item.model} | Created: ${formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}`,
                      });
                    }}
                    selectedItem={selectedTranslation}
                  />
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TranslateLocal() {
  return (
    <TranslateLocalPage />
  );
}