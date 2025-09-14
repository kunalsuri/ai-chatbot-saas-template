/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import React, { useState, useEffect, useRef } from 'react';
import { useOllamaConfig } from '@/features/settings/hooks/useOllamaConfig';
import { useLMStudioConfig } from '@/features/settings/hooks/useLMStudioConfig';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { Badge } from '@/shared/components/ui/badge';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { useToast } from "@/shared/hooks/use-toast";
import { useAuthContext } from "@/features/auth";
import { Loader2, Copy, Check, History, X, Plus, Trash2, MessageSquare, ArrowRight, FileText, PlusCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { useSummaryHistory, type SummaryHistoryItem } from '../hooks/useSummaryHistory';
import { SummaryHistory } from './SummaryHistory';
import { LocalAIModelStatus } from '@/features/chatbot/components/ai/LocalAIModelStatus';
import { summaryApi } from '../api/summary-api';
import { AuthenticationError, ServerRestartError } from "@/features/auth/utils/secureApi";
import { TemplateSelector } from '@/shared/components/ui/TemplateSelector';

type AIProvider = 'ollama' | 'lmstudio';

function SummaryLocalPage() {
  const { checkAuth, user } = useAuthContext();
  const { toast } = useToast();
  const { history, loadSummaryHistory, deleteSummary, addSummary } = useSummaryHistory();
  
  // Debug logging
  console.log('SummaryLocal - Current history:', history);
  console.log('SummaryLocal - History length:', history?.length);
  console.log('SummaryLocal - History type:', typeof history);
  const { config, connectionStatus, availableModels, isConnected, refetchModels: refetchOllamaModels } = useOllamaConfig();
  const { 
    availableModels: lmStudioModels, 
    isConnected: lmStudioConnected,
    connectionStatus: lmStudioConnectionStatus,
    refetchModels: refetchLMStudioModels
  } = useLMStudioConfig();
  
  const [currentModel, setCurrentModel] = useState(config.model);
  const [aiProvider, setAiProvider] = useState<AIProvider>('ollama');
  const [promptText, setPromptText] = useState('');
  const [contentText, setContentText] = useState('');
  const [summaryText, setSummaryText] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [outputMode, setOutputMode] = useState<'text' | 'markdown'>('text');
  const [showHistory, setShowHistory] = useState(true);
  const [tokenCount, setTokenCount] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // History is automatically loaded by the hook

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

  const handleGenerateSummary = async () => {
    if (!promptText.trim() || !contentText.trim()) return;
    
    setIsSummarizing(true);
    setSummaryText('');
    
    try {
      const response = await summaryApi.generate({
        prompt: promptText,
        content: contentText,
        model: currentModel,
        provider: aiProvider
      });
      
      setSummaryText(response.summary);
      setTokenCount(response.tokens || 0);
      
      // Save to history
      await addSummary({
        originalText: promptText,
        summary: response.summary,
        model: currentModel,
        tokens: response.tokens || 0,
        userId: (user?.id as string) || 'local-user'
      });
      
      // History is automatically updated by the hook
      
    } catch (error) {
      console.error('Error generating summary:', error);
      let errorMessage = 'Failed to generate summary';
      
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
      setIsSummarizing(false);
    }
  };

  const handleNewSummary = () => {
    setPromptText('');
    setContentText('');
    setSummaryText('');
    setTokenCount(0);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      duration: 2000,
    });
  };

  const handleSelectFromHistory = (item: SummaryHistoryItem) => {
    setPromptText(item.originalText);
    setContentText(item.originalText);
    setCurrentModel(item.model);
    setSummaryText(item.summary);
    setShowHistory(false);
  };

  const handleDeleteFromHistory = async (id: string) => {
    try {
      await deleteSummary(id);
      toast({
        title: 'Success',
        description: 'Summary deleted from history',
      });
    } catch (error) {
      console.error('Failed to delete summary:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete summary',
        variant: 'destructive',
      });
    }
  };

  const handleSelectTemplate = (text: string) => {
    setPromptText(text);
  };

  return (
    <div className="min-h-screen bg-muted/30 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
              <FileText className="w-8 h-8" />
              AI Summary Generator
            </h1>
            <p className="text-muted-foreground">Generate concise summaries with local AI models</p>
          </div>
          <Button 
            onClick={handleNewSummary} 
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            New Summary
          </Button>
        </div>
        
        {/* AI Model Status */}
        <Card className="p-6 mb-6">
          <LocalAIModelStatus
            currentProvider={aiProvider}
            currentModel={currentModel || 'No model'}
            sessionInfo="Summary history available"
            ollamaConnected={isConnected}
            ollamaModels={availableModels}
            ollamaConnectionStatus={connectionStatus.error || (connectionStatus.connected ? 'Connected' : 'Disconnected')}
            lmStudioConnected={lmStudioConnected}
            lmStudioModels={lmStudioModels || []}
            lmStudioError={lmStudioConnectionStatus.error}
            onProviderChange={handleProviderChange}
            onModelChange={handleModelChange}
            onRefresh={() => {
              if (aiProvider === 'ollama') {
                refetchOllamaModels();
                toast({
                  title: "Refreshing Ollama models",
                  description: "Checking for available models..."
                });
              } else {
                refetchLMStudioModels();
                toast({
                  title: "Refreshing LM Studio models",
                  description: "Checking for available models..."
                });
              }
            }}
            isRefreshing={isSummarizing}
            showProviderToggle={true}
            showModelSelect={true}
            showRefreshButton={true}
            showErrorAlert={true}
          />
        </Card>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
          {/* Summary Configuration */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Summary Configuration</h3>
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

          {/* Summary Interface */}
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Summary Instructions</label>
                <Textarea
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="Enter your summarization instructions here (e.g., 'Summarize in bullet points', 'Create a brief overview')..."
                  className="min-h-[80px]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      handleGenerateSummary();
                    }
                  }}
                />
                <TemplateSelector
                  category="summary"
                  onSelectTemplate={handleSelectTemplate}
                  className="mt-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Content to Summarize</label>
                <Textarea
                  value={contentText}
                  onChange={(e) => setContentText(e.target.value)}
                  placeholder="Paste the content you want to summarize here..."
                  className="min-h-[120px]"
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-muted-foreground">
                    Press Ctrl+Enter to generate summary
                  </p>
                  <Button
                    onClick={handleGenerateSummary}
                    disabled={!promptText.trim() || !contentText.trim() || !getCurrentServerHealth().isOnline || isSummarizing}
                    size="sm"
                  >
                    {isSummarizing ? 'Generating...' : 'Generate Summary'}
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Generated Summary</label>
                <div className="relative">
                  <Textarea
                    value={summaryText}
                    readOnly
                    className="min-h-[120px] bg-background border-border"
                    placeholder={isSummarizing ? 'Generating summary...' : 'Generated summary will appear here...'}
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    {currentModel && summaryText && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                        {currentModel}
                      </Badge>
                    )}
                    {tokenCount > 0 && (
                      <Badge variant="secondary">
                        {tokenCount} tokens
                      </Badge>
                    )}
                    {summaryText && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleCopy(summaryText)}
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

          {/* Right column - History */}
          <div className="lg:col-span-1">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Summary History
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
                <ScrollArea className="h-full">
                  <div className="space-y-2">
                    {history && history.length > 0 ? history.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleSelectFromHistory(item)}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-muted-foreground mb-2">{item.originalText}</p>
                          <p className="text-sm mb-2">{item.summary}</p>
                          <div className="flex justify-between items-center text-xs text-muted-foreground">
                            <span>{item.model}</span>
                            <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 ml-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFromHistory(item.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )) : null}
                    {(!history || history.length === 0) && (
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No summaries yet</p>
                        <p className="text-sm">Generate your first summary to see it here</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            )}
          </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SummaryLocal() {
  return (
    <SummaryLocalPage />
  );
}