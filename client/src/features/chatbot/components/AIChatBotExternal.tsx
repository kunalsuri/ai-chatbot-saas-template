/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { useToast } from "@/shared/hooks/use-toast";
import { MessageCircle, Send, Plus, Trash2, ChevronLeft, ChevronRight, Bot, User, Zap, AlertTriangle, CheckCircle, XCircle, Settings, History, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import ExternalAIModelStatus from './ai/ExternalAIModelStatus';
import { ChatDeleteConfirmation } from '@/shared/components/ui/delete-confirmation-dialog';
import { secureGet, securePost, secureDelete, AuthenticationError, ServerRestartError } from "@/features/auth/utils/secureApi";
import { useAuthContext } from "@/features/auth";
import { TemplateSelector } from '@/shared/components/ui/TemplateSelector';
import { useExternalAI } from "@/features/chatbot/hooks/useExternalAI";
import { ExternalProvider } from '@/features/model-management/types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    model?: string;
    provider?: string;
    responseTime?: number;
    usage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
  };
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

function AIChatBotExternal() {
  const { checkAuth } = useAuthContext();
  const { toast } = useToast();
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentProvider, setCurrentProvider] = useState<ExternalProvider>('google');
  const [currentModel, setCurrentModel] = useState('');
  const [showHistory, setShowHistory] = useState(() => {
    const saved = localStorage.getItem('externalChatHistorySidebarOpen');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    sessionId: string | null;
    sessionTitle: string;
    messageCount: number;
    lastUpdated: Date;
    isLoading: boolean;
  }>({ isOpen: false, sessionId: null, sessionTitle: '', messageCount: 0, lastUpdated: new Date(), isLoading: false });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use external AI hook
  const { providers, isLoading: healthCheckLoading, refreshHealth, generateResponse } = useExternalAI();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages]);

  useEffect(() => {
    loadChatHistory();
  }, []);

  useEffect(() => {
    localStorage.setItem('externalChatHistorySidebarOpen', JSON.stringify(showHistory));
  }, [showHistory]);

  // Set default model when provider changes
  useEffect(() => {
    const providerModels = providers[currentProvider]?.models || [];
    if (providerModels.length > 0 && !currentModel) {
      setCurrentModel(providerModels[0]);
    }
  }, [currentProvider, providers, currentModel]);

  const loadChatHistory = async () => {
    try {
      const response = await secureGet('/api/chat/history');
      
      // Convert timestamp strings to Date objects
      const processedHistory = (response.data || []).map((session: ChatSession) => {
        return {
          ...session,
          messages: session.messages.map((message: Message) => {
            return {
              ...message,
              timestamp: new Date(message.timestamp)
            };
          }),
          createdAt: new Date(session.createdAt),
          updatedAt: new Date(session.updatedAt)
        };
      });
      
      // Sort chat history by updatedAt date in descending order (newest first)
      const sortedHistory = [...processedHistory].sort((a, b) => 
        b.updatedAt.getTime() - a.updatedAt.getTime()
      );
      
      setChatHistory(sortedHistory);
    } catch (error) {
      console.error('Failed to load chat history:', error);
      if (error instanceof AuthenticationError || error instanceof ServerRestartError) {
        await checkAuth();
        toast({
          title: "Session Expired",
          description: "Please log in to access chat history",
          variant: "destructive"
        });
      }
    }
  };

  const createNewChat = () => {
    const newSession: ChatSession = {
      id: `chat_${Date.now()}`,
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setCurrentSession(newSession);
  };

  const selectChatSession = (session: ChatSession) => {
    const processedSession = {
      ...session,
      messages: session.messages.map(message => ({
        ...message,
        timestamp: message.timestamp instanceof Date ? message.timestamp : new Date(message.timestamp)
      })),
      createdAt: session.createdAt instanceof Date ? session.createdAt : new Date(session.createdAt),
      updatedAt: session.updatedAt instanceof Date ? session.updatedAt : new Date(session.updatedAt)
    };
    setCurrentSession(processedSession);
  };

  const openDeleteConfirmation = (session: ChatSession) => {
    setDeleteConfirmation({
      isOpen: true,
      sessionId: session.id,
      sessionTitle: session.title,
      messageCount: session.messages.length,
      lastUpdated: session.updatedAt instanceof Date ? session.updatedAt : new Date(session.updatedAt),
      isLoading: false,
    });
  };

  const closeDeleteConfirmation = () => {
    setDeleteConfirmation(prev => ({ ...prev, isOpen: false }));
  };

  const confirmDeleteChatSession = async () => {
    if (!deleteConfirmation.sessionId) return;

    setDeleteConfirmation(prev => ({ ...prev, isLoading: true }));

    try {
      await secureDelete(`/api/chat/history/${deleteConfirmation.sessionId}`);
      
      setChatHistory(prev => prev.filter(session => session.id !== deleteConfirmation.sessionId));
      
      if (currentSession?.id === deleteConfirmation.sessionId) {
        setCurrentSession(null);
      }

      toast({
        title: "Chat Deleted",
        description: "Chat session has been successfully deleted.",
      });
    } catch (error) {
      console.error('Failed to delete chat session:', error);
      if (error instanceof AuthenticationError || error instanceof ServerRestartError) {
        await checkAuth();
        toast({
          title: "Authentication Required",
          description: "Please log in to delete chats",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Delete Failed",
          description: "Failed to delete chat session. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setDeleteConfirmation(prev => ({ ...prev, isLoading: false }));
      closeDeleteConfirmation();
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const providerHealth = providers[currentProvider];
    if (!providerHealth?.connected) {
      toast({
        title: "Provider Offline",
        description: `${currentProvider} is not available. Please check your API key configuration.`,
        variant: "destructive"
      });
      return;
    }

    if (!providerHealth.models || providerHealth.models.length === 0) {
      toast({
        title: "No Models Available",
        description: `No models are available for ${currentProvider}. Please check your configuration.`,
        variant: "destructive"
      });
      return;
    }

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    let updatedSession = currentSession;
    if (!updatedSession) {
      updatedSession = {
        id: `chat_${Date.now()}`,
        title: inputMessage.slice(0, 50) + (inputMessage.length > 50 ? '...' : ''),
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setCurrentSession(updatedSession);
    }

    updatedSession.messages.push(userMessage);
    updatedSession.updatedAt = new Date();
    setCurrentSession({ ...updatedSession });
    setInputMessage('');
    setIsLoading(true);

    try {
      const modelToUse = currentModel || providerHealth.models[0];
      
      const response = await generateResponse(
        currentProvider,
        inputMessage,
        updatedSession.messages.slice(-10).map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        {
          model: modelToUse,
          temperature: 0.7,
          maxTokens: 1000
        }
      );

      const assistantMessage: Message = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
        metadata: {
          model: response.model,
          provider: response.provider,
          usage: response.usage
        }
      };

      updatedSession.messages.push(assistantMessage);
      updatedSession.updatedAt = new Date();
      setCurrentSession({ ...updatedSession });

      // Save session
      await securePost('/api/chat/save', updatedSession);
      
      // Update history
      setChatHistory(prev => {
        const existing = prev.find(s => s.id === updatedSession!.id);
        let newHistory;
        
        if (existing) {
          newHistory = prev.map(s => s.id === updatedSession!.id ? updatedSession! : s);
        } else {
          newHistory = [updatedSession!, ...prev];
        }
        
        return newHistory.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      });

    } catch (error) {
      console.error('Failed to send message:', error);
      if (error instanceof AuthenticationError || error instanceof ServerRestartError) {
        await checkAuth();
        toast({
          title: "Authentication Required",
          description: "Please log in to send messages",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Message Failed",
          description: "Failed to send message. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // No special handling needed - Enter will naturally create a new line
  };

  const toggleHistorySidebar = () => {
    setShowHistory(!showHistory);
  };

  const handleProviderChange = (provider: ExternalProvider) => {
    setCurrentProvider(provider);
    setCurrentModel(''); // Reset model when provider changes
  };

  const handleModelChange = (model: string) => {
    setCurrentModel(model);
  };

  const handleSelectTemplate = (text: string) => {
    setInputMessage(text);
  };

  return (
    <div className="flex h-full bg-gradient-to-br from-background/50 to-muted/30">
      {/* Chat History Sidebar */}
      {showHistory && (
        <div className="w-80 bg-background border-r border-border flex flex-col shadow-sm">
          <div className="p-4 border-b border-border/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <History className="w-5 h-5" />
                Chat History
              </h2>
              <Button
                onClick={toggleHistorySidebar}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </div>
            <Button
              onClick={createNewChat}
              className="w-full bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-2">
              {chatHistory.map((session) => (
                <div
                  key={session.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                    currentSession?.id === session.id
                      ? 'bg-brand-50 border-brand-200'
                      : 'bg-background border-border hover:bg-accent/50'
                  }`}
                  onClick={() => selectChatSession(session)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-foreground truncate">
                        {session.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {session.messages.length} messages
                      </p>
                      <p className="text-xs text-muted-foreground/70">
                        {new Date(session.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteConfirmation(session);
                      }}
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive ml-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-background border-b border-border p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {!showHistory && (
                <Button
                  onClick={toggleHistorySidebar}
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                >
                  <ChevronRight className="w-4 h-4 mr-2" />
                  History
                </Button>
              )}
              <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Globe className="w-6 h-6 text-brand-600" />
                AI ChatBot External
              </h1>
            </div>

            {/* External AI Model Status */}
            <ExternalAIModelStatus
              currentProvider={currentProvider}
              currentModel={currentModel || 'No model'}
              sessionInfo={currentSession ? `${currentSession.messages.length} messages` : 'No active chat'}
              googleConnected={providers.google?.connected || false}
              googleModels={providers.google?.models || []}
              googleError={providers.google?.error}
              anthropicConnected={providers.anthropic?.connected || false}
              anthropicModels={providers.anthropic?.models || []}
              anthropicError={providers.anthropic?.error}
              mistralConnected={providers.mistral?.connected || false}
              mistralModels={providers.mistral?.models || []}
              mistralError={providers.mistral?.error}
              openaiConnected={providers.openai?.connected || false}
              openaiModels={providers.openai?.models || []}
              openaiError={providers.openai?.error}
              onProviderChange={handleProviderChange}
              onModelChange={handleModelChange}
              onRefresh={refreshHealth}
              isRefreshing={healthCheckLoading}
              showProviderSelect={true}
              showModelSelect={true}
              showRefreshButton={true}
              showErrorAlert={true}
              showApiKeyStatus={true}
              compact={false}
            />
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-hidden">
          {currentSession ? (
            <ScrollArea className="h-full p-4">
              <div className="max-w-4xl mx-auto space-y-4">
                {currentSession.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.role === 'user'
                          ? 'bg-brand-500 text-white'
                          : 'bg-muted border border-border text-foreground'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {message.role === 'assistant' && (
                          <Globe className="w-5 h-5 mt-0.5 text-brand-600 flex-shrink-0" />
                        )}
                        {message.role === 'user' && (
                          <User className="w-5 h-5 mt-0.5 text-white flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className="whitespace-pre-wrap break-words">{message.content}</p>
                          <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                            <span>{message.timestamp.toLocaleTimeString()}</span>
                            {message.metadata?.model && (
                              <span className="ml-2">{message.metadata.model}</span>
                            )}
                            {message.metadata?.usage && (
                              <span className="ml-2">
                                {message.metadata.usage.totalTokens} tokens
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted border border-border rounded-lg px-4 py-2 flex items-center gap-2">
                      <Globe className="w-5 h-5 text-brand-600" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-brand-600 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-brand-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-brand-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-md mx-auto p-6">
                <Globe className="w-16 h-16 text-brand-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Welcome to AI ChatBot External</h3>
                <p className="text-muted-foreground mb-6">
                  Start a conversation with external AI providers like Google AI, Anthropic, Mistral, and OpenAI. Configure your API keys to get started.
                </p>
                <Button
                  onClick={createNewChat}
                  className="bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Start New Chat
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        {currentSession && (
          <div className="border-t border-border p-4 bg-background">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col gap-3">
                <div className="flex gap-2 relative">
                  <div className="relative flex-1 border border-input rounded-md focus-within:border-ring transition-colors duration-200">
                    <textarea
                      value={inputMessage}
                      onChange={(e) => {
                        setInputMessage(e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = `${e.target.scrollHeight}px`;
                      }}
                      onKeyDown={handleKeyPress}
                      placeholder={`Message ${currentProvider}...`}
                      disabled={isLoading || !providers[currentProvider]?.connected}
                      rows={1}
                      className={cn(
                        "w-full resize-none bg-transparent px-3 py-2 pr-10",
                        "text-foreground placeholder:text-muted-foreground",
                        "border-0 outline-none focus:ring-0 focus:outline-none",
                        "min-h-[40px] max-h-[200px] overflow-y-auto",
                        "font-sans text-base leading-normal"
                      )}
                      style={{
                        scrollbarWidth: 'thin',
                        scrollbarColor: 'var(--muted-foreground) transparent'
                      }}
                    />
                  </div>
                  <Button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || isLoading || !providers[currentProvider]?.connected}
                    className="bg-brand-500 hover:bg-brand-600 text-white flex-shrink-0"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground flex items-center justify-center border border-border/30 bg-muted/20 py-1 rounded-sm">
                  Press Enter to add a new line. Click Send to submit your message.
                </p>
                <TemplateSelector 
                  category="chat"
                  onSelectTemplate={handleSelectTemplate}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ChatDeleteConfirmation
        isOpen={deleteConfirmation.isOpen}
        onClose={closeDeleteConfirmation}
        onConfirm={confirmDeleteChatSession}
        chatTitle={deleteConfirmation.sessionTitle}
        messageCount={deleteConfirmation.messageCount}
        lastUpdated={deleteConfirmation.lastUpdated}
        isLoading={deleteConfirmation.isLoading}
      />
    </div>
  );
};

export default AIChatBotExternal;
