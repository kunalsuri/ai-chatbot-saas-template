/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import React, { useState, useEffect, useRef } from 'react';
import { useOllamaConfig, useLMStudioConfig } from '@/features/settings';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { Badge } from '@/shared/components/ui/badge';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { useToast } from "@/shared/hooks/use-toast";
import { useAuthContext } from '@/features/auth';
import { Loader2, Copy, Check, History, X, Plus, Trash2, MessageSquare, ArrowRight, Sparkles, PlusCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { PromptImproverHistory } from './PromptImproverHistory';
import { PromptImproverDeleteConfirmation } from '@/shared/components/ui/prompt-improver-delete-confirmation';
import { usePromptImproverHistory, type PromptImproverHistoryItem } from '../hooks/usePromptImproverHistory';
import { LocalAIModelStatus } from '@/features/chatbot/components/ai/LocalAIModelStatus';
import { api } from '@/lib/api';
import { AuthenticationError, ServerRestartError } from "@/features/auth/utils/secureApi";
import { TemplateSelector } from '@/shared/components/ui/TemplateSelector';

type AIProvider = 'ollama' | 'lmstudio';

function PromptImproverLocalPage() {
  const { checkAuth } = useAuthContext();
  const { toast } = useToast();
  const { history, loadImprovementHistory, deleteImprovement, addImprovement } = usePromptImproverHistory();
  const { config, connectionStatus, availableModels, isConnected, refetchModels: refetchOllamaModels } = useOllamaConfig();
  const { 
    availableModels: lmStudioModels, 
    isConnected: lmStudioConnected,
    connectionStatus: lmStudioConnectionStatus,
    refetchModels: refetchLMStudioModels
  } = useLMStudioConfig();
  
  const [currentModel, setCurrentModel] = useState(config.model);
  const [aiProvider, setAiProvider] = useState<AIProvider>('ollama');
  const [inputText, setInputText] = useState('');
  const [improvedText, setImprovedText] = useState('');
  const [isImproving, setIsImproving] = useState(false);
  const [outputMode, setOutputMode] = useState<'text' | 'markdown'>('text');
  const [showHistory, setShowHistory] = useState(true);
  const [tokenCount, setTokenCount] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load improvement history when component mounts
  useEffect(() => {
    loadImprovementHistory();
  }, [loadImprovementHistory]);

  const getCurrentServerHealth = () => {
    return aiProvider === 'ollama' 
      ? { isOnline: isConnected, models: availableModels, error: isConnected ? undefined : connectionStatus.error }
      : { isOnline: lmStudioConnected, models: lmStudioModels, error: lmStudioConnectionStatus.error };
  };

  const getAvailableModels = () => {
    return getCurrentServerHealth().models;
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

  const handleImprovePrompt = async () => {
    if (!inputText.trim()) return;
    
    setIsImproving(true);
    setImprovedText('');
    
    try {
      const response = await api.improvePrompt({
        prompt: inputText,
        model: currentModel,
        outputMode
      });
      
      setImprovedText(response.improved);
      setTokenCount(response.tokens);
      
      // Save to history
      await addImprovement({
        original: inputText,
        improved: response.improved,
        model: currentModel,
        provider: aiProvider,
        tokens: response.tokens,
        userId: 'local-user'
      });
      
    } catch (error) {
      console.error('Error improving prompt:', error);
      let errorMessage = 'Failed to improve prompt';
      
      if (error instanceof AuthenticationError || error instanceof ServerRestartError) {
        await checkAuth();
        errorMessage = 'Session expired. Please log in again.';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsImproving(false);
    }
  };

  const handleNewImprovement = () => {
    setInputText('');
    setImprovedText('');
    setTokenCount(0);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      duration: 2000,
    });
  };

  const handleHistorySelect = (item: any) => {
    setInputText(item.original);
    setImprovedText(item.improved);
    setCurrentModel(item.model);
    setTokenCount(item.tokens);
  };

  const handleSelectFromHistory = (item: PromptImproverHistoryItem) => {
    setInputText(item.original);
    setCurrentModel(item.model);
    setAiProvider(item.provider as AIProvider);
    setImprovedText(item.improved);
    setShowHistory(false);
  };

  const handleDeleteFromHistory = async (id: string) => {
    try {
      await deleteImprovement(id);
      toast({
        title: 'Success',
        description: 'Prompt improvement deleted from history',
      });
    } catch (error) {
      console.error('Failed to delete prompt improvement:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete prompt improvement',
        variant: 'destructive',
      });
    }
  };

  const handleSelectTemplate = (text: string) => {
    setInputText(text);
  };

  return (
    <div className="min-h-screen bg-muted/30 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
              <Sparkles className="w-8 h-8" />
              AI Prompt Improver Local
            </h1>
            <p className="text-muted-foreground">Enhance your prompts with local AI models</p>
          </div>
          <Button 
            onClick={handleNewImprovement} 
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            New Improvement
          </Button>
        </div>
        
        {/* AI Model Status */}
        <Card className="p-6 mb-6">
          <LocalAIModelStatus
            currentProvider={aiProvider}
            currentModel={currentModel || 'No model'}
            sessionInfo="Prompt improvement history available"
            ollamaConnected={isConnected}
            ollamaModels={availableModels}
            ollamaConnectionStatus={connectionStatus.error || (connectionStatus.connected ? 'Connected' : 'Disconnected')}
            lmStudioConnected={lmStudioConnected}
            lmStudioModels={lmStudioModels || []}
            lmStudioError={lmStudioConnectionStatus.error || undefined}
            onProviderChange={handleProviderChange}
            onModelChange={handleModelChange}
            onRefresh={() => {
              if (aiProvider === 'ollama') {
                // Refresh Ollama models
                refetchOllamaModels();
                toast({
                  title: "Refreshing Ollama models",
                  description: "Checking for available models..."
                });
              } else {
                // Refresh LM Studio models
                refetchLMStudioModels();
                toast({
                  title: "Refreshing LM Studio models",
                  description: "Checking for available models..."
                });
              }
            }}
            isRefreshing={isImproving}
            showProviderToggle={true}
            showModelSelect={true}
            showRefreshButton={true}
            showErrorAlert={true}
          />
        </Card>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
          {/* Prompt Improvement Configuration */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Prompt Improvement Configuration</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Output Mode</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Text</span>
                  <Switch checked={outputMode === 'markdown'} onCheckedChange={(checked) => setOutputMode(checked ? 'markdown' : 'text')} />
                  <span className="text-sm text-muted-foreground">Markdown</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Prompt Improvement Interface */}
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Original Prompt</label>
                <Textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Enter your prompt here..."
                  className="min-h-[120px]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      handleImprovePrompt();
                    }
                  }}
                />
                <TemplateSelector
                  category="prompt"
                  onSelectTemplate={handleSelectTemplate}
                  className="mt-2"
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-muted-foreground">
                    Press Ctrl+Enter to improve
                  </p>
                  <Button
                    onClick={handleImprovePrompt}
                    disabled={!inputText.trim() || !getCurrentServerHealth().isOnline || isImproving}
                    size="sm"
                  >
                    {isImproving ? 'Improving...' : 'Improve Prompt'}
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Improved Prompt</label>
                <div className="relative">
                  <Textarea
                    value={improvedText}
                    readOnly
                    className="min-h-[120px] bg-background border-border"
                    placeholder={isImproving ? 'Improving...' : 'Improved prompt will appear here...'}
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    {currentModel && improvedText && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                        {currentModel}
                      </Badge>
                    )}
                    {tokenCount > 0 && (
                      <Badge variant="secondary">
                        {tokenCount} tokens
                      </Badge>
                    )}
                    {improvedText && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleCopy(improvedText)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
          </div>

          {/* Right column - Settings and History */}
          <div className="lg:col-span-1">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Prompt History
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
                <PromptImproverHistory 
                  onSelect={(item) => {
                    setInputText(item.original);
                    setImprovedText(item.improved);
                    setCurrentModel(item.model);
                    setAiProvider(item.provider as AIProvider);
                    setTokenCount(item.tokens || 0);
                    
                    // Show toast with model details
                    toast({
                      title: "Prompt Improvement Loaded",
                      description: `Model: ${item.model} | Created: ${new Date(item.timestamp).toLocaleString()}`,
                    });
                  }}
                  onDelete={handleDeleteFromHistory}
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

export default function PromptImproverLocal() {
  return (
    <PromptImproverLocalPage />
  );
}