/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Separator } from '@/shared/components/ui/separator';
import { CheckCircle, XCircle, Loader2, Play, Square, Zap, AlertTriangle, Server, RefreshCw } from 'lucide-react';
import { securePost } from "@/features/auth/utils/secureApi";
import { useAuthContext } from '@/features/auth';
import { useToast } from "@/shared/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { OllamaConfigPanel, LMStudioConfigPanel } from '@/features/settings';
import { useOllamaConfig } from "@/features/settings/hooks/useOllamaConfig";
import { useLMStudioConfig } from "@/features/settings/hooks/useLMStudioConfig";

interface Model {
  name: string;
  size?: string;
  modified?: string;
  digest?: string;
  status?: 'active' | 'inactive' | 'loading' | 'error';
  id?: string;
  state?: 'loaded' | 'not-loaded';
  type?: string;
  quantization?: string;
  maxContext?: number | null;
  publisher?: string;
}

interface ServerStatus {
  connected: boolean;
  isOnline?: boolean;
  models: Model[];
  error?: string;
}

interface ServerStatusCardProps {
  title: string;
  status: ServerStatus;
  onRefresh: () => void;
  provider: 'ollama' | 'lmstudio';
  healthCheckEnabled?: boolean;
}

function ServerStatusCard({
  title,
  status,
  onRefresh,
  provider,
  healthCheckEnabled = true
}: ServerStatusCardProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Server className="w-6 h-6 text-muted-foreground" />
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          {healthCheckEnabled && (
            <div className="flex items-center gap-2">
              <Badge variant={status.isOnline ? "default" : "destructive"} className="flex items-center gap-1">
                {status.isOnline ? 'Online' : 'Offline'}
              </Badge>
            </div>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {!healthCheckEnabled && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Health checks are disabled for {provider === 'lmstudio' ? 'LM Studio' : 'Ollama'}. 
            Enable in configuration to see connection status.
          </AlertDescription>
        </Alert>
      )}

      {healthCheckEnabled && status.error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{status.error}</AlertDescription>
        </Alert>
      )}

      {status.models.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No models found. Make sure models are installed and available.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {status.models.map((model, index) => (
            <Card key={index} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-foreground">{model.name}</h3>
                      {model.status && (
                        <Badge 
                          variant={
                            model.status === 'active' ? 'default' : 
                            model.status === 'loading' ? 'secondary' : 
                            'outline'
                          }
                          className="text-xs"
                        >
                          {model.state || model.status}
                        </Badge>
                      )}
                      {model.type && (
                        <Badge variant="outline" className="text-xs">
                          {model.type.toUpperCase()}
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-1">
                      {model.publisher && (
                        <p className="text-sm text-muted-foreground">Publisher: {model.publisher}</p>
                      )}
                      {model.quantization && (
                        <p className="text-sm text-muted-foreground">Quantization: {model.quantization}</p>
                      )}
                      {model.maxContext && (
                        <p className="text-sm text-muted-foreground">Max Context: {model.maxContext.toLocaleString()} tokens</p>
                      )}
                      {model.size && (
                        <p className="text-sm text-muted-foreground">Size: {model.size}</p>
                      )}
                      {model.modified && (
                        <p className="text-xs text-muted-foreground/70">Modified: {new Date(model.modified).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function LocalModelManagement() {
  const { checkAuth } = useAuthContext();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('ollama');
  
  // Use the consolidated Ollama configuration hook with auto-connect
  const {
    config: ollamaConfig,
    updateConfig: updateOllamaConfig,
    connectionStatus: ollamaConnectionStatus,
    availableModels: ollamaModels,
    isConnected: ollamaConnected,
    isOnline: ollamaIsOnline,
    refreshAll: refreshOllama,
    retryConnection: retryOllamaConnection
  } = useOllamaConfig();

  // Use the consolidated LM Studio configuration hook with improved error handling
  const {
    config: lmStudioConfig,
    updateConfig: updateLMStudioConfig,
    connectionStatus: lmStudioConnectionStatus,
    availableModels: lmStudioModels,
    isConnected: lmStudioConnected,
    isOnline: lmStudioIsOnline,
    refreshAll: refreshLMStudio,
    retryConnection: retryLMStudioConnection
  } = useLMStudioConfig();

  // Authentication check on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <div className="h-full bg-gradient-to-br from-background/50 to-muted/30 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Local LLM Management</h1>
          <p className="text-muted-foreground">
            Manage and monitor your local language models across Ollama and LM Studio
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="ollama" className="flex items-center gap-2">
              <Server className="w-4 h-4" />
              Ollama
            </TabsTrigger>
            <TabsTrigger value="lmstudio" className="flex items-center gap-2">
              <Server className="w-4 h-4" />
              LM Studio
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ollama" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-5 h-5" />
                  Ollama Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <OllamaConfigPanel
                  config={ollamaConfig}
                  onConfigChange={updateOllamaConfig}
                  showAdvanced={true}
                />
                
                <Separator className="my-4" />
                
                <ServerStatusCard
                  title="Ollama Server Status"
                  status={{
                    connected: ollamaConnected,
                    isOnline: ollamaIsOnline,
                    models: ollamaModels.map(model => ({
                      name: model,
                      status: 'inactive' as const
                    })),
                    ...(ollamaConnectionStatus.error && { error: ollamaConnectionStatus.error })
                  }}
                  onRefresh={(ollamaConnectionStatus.retryCount ?? 0) > 2 ? retryOllamaConnection : refreshOllama}
                  provider="ollama"
                  healthCheckEnabled={ollamaConfig.healthCheckEnabled}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lmstudio" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-5 h-5" />
                  LM Studio Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <LMStudioConfigPanel
                  config={lmStudioConfig}
                  onConfigChange={updateLMStudioConfig}
                  showAdvanced={true}
                />
                
                <Separator className="my-4" />
                
                <ServerStatusCard
                  title="LM Studio Server Status"
                  status={{
                    connected: lmStudioConnected,
                    isOnline: lmStudioIsOnline,
                    models: lmStudioModels.map(model => ({
                      name: model,
                      status: 'inactive' as const
                    })),
                    ...(lmStudioConnectionStatus.error && { error: lmStudioConnectionStatus.error })
                  }}
                  onRefresh={(lmStudioConnectionStatus.retryCount ?? 0) > 2 ? retryLMStudioConnection : refreshLMStudio}
                  provider="lmstudio"
                  healthCheckEnabled={lmStudioConfig.healthCheckEnabled}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <h3 className="font-medium text-foreground mb-2">Setup Instructions</h3>
          <div className="text-sm text-foreground/90 space-y-1">
            <p><strong>Ollama:</strong> Make sure Ollama is running with <code className="bg-primary/10 px-1.5 py-0.5 rounded text-foreground/90">ollama serve</code></p>
            <p><strong>LM Studio:</strong> Start the local server in LM Studio (default port 1234)</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LocalModelManagement;
