/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import { useExternalModelManagement } from "@/features/model-management/hooks/useExternalModelManagement";
import { ProviderCard } from './external-model-mgmt/ProviderCard';
import { ModelCard } from './external-model-mgmt/ModelCard';
import { ModelTestDialog } from './external-model-mgmt/ModelTestDialog';
import { ExternalProvider } from '../types';
import { RefreshCw, Settings, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ExternalModelManagement() {
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [testingModelId, setTestingModelId] = useState<string | null>(null);

  const {
    providers,
    models,
    selectedProvider,
    testMessage,
    isLoadingProviders,
    isLoadingModels,
    isTestingModel,
    providersError,
    modelsError,
    testError,
    testResult,
    setSelectedProvider,
    setTestMessage,
    testModel,
    checkProviderHealth,
    refetchProviders,
    refetchModels,
    getConfiguredProviders,
    getUnconfiguredProviders,
    resetTestResult,
  } = useExternalModelManagement();

  const handleProviderSelect = (provider: ExternalProvider) => {
    setSelectedProvider(provider);
    resetTestResult();
  };

  const handleModelTest = (modelId: string) => {
    setTestingModelId(modelId);
    setTestDialogOpen(true);
    resetTestResult();
  };

  const handleTestModel = () => {
    if (selectedProvider && testingModelId) {
      testModel(selectedProvider, testingModelId, testMessage);
    }
  };

  const configuredProviders = getConfiguredProviders();
  const unconfiguredProviders = getUnconfiguredProviders();
  const selectedProviderData = providers.find(p => p.provider === selectedProvider);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">External Model Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage and test external AI provider models
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => refetchProviders()}
          disabled={isLoadingProviders}
          className="flex items-center space-x-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoadingProviders ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Error States */}
      {providersError && (
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-4 w-4" />
              <span>Failed to load providers: {providersError.message}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Providers Sidebar */}
        <div className="space-y-6">
          {/* Configured Providers */}
          {configuredProviders.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Configured Providers</span>
                  <Badge variant="secondary">{configuredProviders.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {configuredProviders.map((providerData) => (
                  <ProviderCard
                    key={providerData.provider}
                    provider={providerData.provider}
                    isConfigured={providerData.isConfigured}
                    health={providerData.health}
                    modelCount={providerData.models.length}
                    isSelected={selectedProvider === providerData.provider}
                    isCheckingHealth={false}
                    onSelect={() => handleProviderSelect(providerData.provider)}
                    onHealthCheck={() => checkProviderHealth(providerData.provider)}
                  />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Unconfigured Providers */}
          {unconfiguredProviders.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-gray-500" />
                  <span>Available Providers</span>
                  <Badge variant="outline">{unconfiguredProviders.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {unconfiguredProviders.map((providerData) => (
                  <ProviderCard
                    key={providerData.provider}
                    provider={providerData.provider}
                    isConfigured={providerData.isConfigured}
                    health={providerData.health}
                    modelCount={0}
                    isSelected={false}
                    isCheckingHealth={false}
                    onSelect={() => {}}
                    onHealthCheck={() => {}}
                  />
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Models Content */}
        <div className="lg:col-span-2 space-y-6">
          {selectedProvider ? (
            <>
              {/* Provider Info */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <span>{selectedProviderData?.provider.toUpperCase()} Models</span>
                      <Badge variant="secondary">{models.length}</Badge>
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refetchModels()}
                      disabled={isLoadingModels}
                    >
                      <RefreshCw className={`h-3 w-3 ${isLoadingModels ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </CardHeader>
                
                {selectedProviderData && (
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Status</div>
                        <div className="font-medium">
                          {selectedProviderData.health.connected ? 'Connected' : 'Disconnected'}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Models</div>
                        <div className="font-medium">{models.length}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Latency</div>
                        <div className="font-medium">
                          {selectedProviderData.health.latency ? `${selectedProviderData.health.latency}ms` : 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Default</div>
                        <div className="font-medium">{selectedProviderData.defaultModel}</div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Models Grid */}
              {modelsError && (
                <Card className="border-red-200 dark:border-red-800">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Failed to load models: {modelsError.message}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              <AnimatePresence mode="wait">
                {isLoadingModels ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {[...Array(4)].map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <CardHeader>
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="h-3 bg-gray-200 rounded"></div>
                            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </motion.div>
                ) : models.length > 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {models.map((model, index) => (
                      <motion.div
                        key={model.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <ModelCard
                          model={model}
                          onTest={handleModelTest}
                          isTestingModel={isTestingModel}
                          testingModelId={testingModelId}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <Card>
                      <CardContent className="p-8 text-center">
                        <div className="text-muted-foreground">
                          No models available for this provider
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-muted-foreground">
                  Select a configured provider to view available models
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Model Test Dialog */}
      <ModelTestDialog
        isOpen={testDialogOpen}
        onClose={() => {
          setTestDialogOpen(false);
          setTestingModelId(null);
        }}
        provider={selectedProvider}
        model={testingModelId}
        testMessage={testMessage}
        onTestMessageChange={setTestMessage}
        onTest={handleTestModel}
        isTestingModel={isTestingModel}
        testResult={testResult}
        testError={testError}
      />
    </div>
  );
}
