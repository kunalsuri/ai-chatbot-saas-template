/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { ExternalProvider, ExternalAIHealthCheck } from '../../types';
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProviderCardProps {
  provider: ExternalProvider;
  isConfigured: boolean;
  health: ExternalAIHealthCheck;
  modelCount: number;
  isSelected: boolean;
  isCheckingHealth: boolean;
  onSelect: () => void;
  onHealthCheck: () => void;
}

const providerNames = {
  google: 'Google AI Studio',
  anthropic: 'Anthropic Claude',
  mistral: 'Mistral AI',
  openai: 'OpenAI GPT',
} as const;

const providerColors = {
  google: 'bg-blue-500',
  anthropic: 'bg-orange-500',
  mistral: 'bg-purple-500',
  openai: 'bg-green-500',
} as const;

export function ProviderCard({
  provider,
  isConfigured,
  health,
  modelCount,
  isSelected,
  isCheckingHealth,
  onSelect,
  onHealthCheck,
}: ProviderCardProps) {
  const getStatusIcon = () => {
    if (!isConfigured) {
      return <Settings className="h-4 w-4 text-gray-400" />;
    }
    
    if (health.connected) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusText = () => {
    if (!isConfigured) {
      return 'Not Configured';
    }
    
    if (health.connected) {
      return `Connected (${modelCount} models)`;
    }
    
    return health.error || 'Connection Failed';
  };

  const getStatusColor = () => {
    if (!isConfigured) return 'secondary';
    return health.connected ? 'default' : 'destructive';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className={`cursor-pointer transition-all duration-200 ${
          isSelected 
            ? 'ring-2 ring-primary shadow-lg' 
            : 'hover:shadow-md'
        } ${!isConfigured ? 'opacity-60' : ''}`}
        onClick={onSelect}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${providerColors[provider]}`} />
              <CardTitle className="text-lg font-semibold">
                {providerNames[provider]}
              </CardTitle>
            </div>
            {getStatusIcon()}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <Badge variant={getStatusColor() as any} className="text-xs">
              {getStatusText()}
            </Badge>
            
            {isConfigured && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onHealthCheck();
                }}
                disabled={isCheckingHealth}
                className="h-8 px-2"
              >
                <RefreshCw className={`h-3 w-3 ${isCheckingHealth ? 'animate-spin' : ''}`} />
              </Button>
            )}
          </div>
          
          {health.latency && (
            <div className="text-xs text-muted-foreground">
              Latency: {health.latency}ms
            </div>
          )}
          
          {!isConfigured && (
            <div className="text-xs text-muted-foreground">
              Add API key to environment variables to enable
            </div>
          )}
          
          {health.error && (
            <div className="flex items-start space-x-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-md">
              <AlertCircle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-red-600 dark:text-red-400">
                {health.error}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
