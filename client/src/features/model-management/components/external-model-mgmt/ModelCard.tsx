/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { ExternalAIModel } from '../../types';
import { Play, Info, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface ModelCardProps {
  model: ExternalAIModel;
  onTest: (modelId: string) => void;
  isTestingModel: boolean;
  testingModelId?: string;
}

export function ModelCard({ model, onTest, isTestingModel, testingModelId }: ModelCardProps) {
  const isCurrentlyTesting = isTestingModel && testingModelId === model.id;

  const formatContextLength = (length?: number) => {
    if (!length) return 'Unknown';
    if (length >= 1000000) return `${(length / 1000000).toFixed(1)}M`;
    if (length >= 1000) return `${(length / 1000).toFixed(0)}K`;
    return length.toString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full hover:shadow-md transition-shadow duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <CardTitle className="text-base font-semibold leading-tight">
                {model.name || model.id}
              </CardTitle>
              {model.name && model.name !== model.id && (
                <div className="text-xs text-muted-foreground font-mono">
                  {model.id}
                </div>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onTest(model.id)}
              disabled={isTestingModel}
              className="ml-2 h-8 px-3"
            >
              {isCurrentlyTesting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Zap className="h-3 w-3" />
                </motion.div>
              ) : (
                <Play className="h-3 w-3" />
              )}
              <span className="ml-1 text-xs">
                {isCurrentlyTesting ? 'Testing...' : 'Test'}
              </span>
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {model.description && (
            <div className="text-sm text-muted-foreground line-clamp-2">
              {model.description}
            </div>
          )}
          
          <div className="flex flex-wrap gap-2">
            {model.contextLength && (
              <Badge variant="secondary" className="text-xs">
                <Info className="h-3 w-3 mr-1" />
                {formatContextLength(model.contextLength)} tokens
              </Badge>
            )}
          </div>
          
          {/* Placeholder for additional metadata */}
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div>
              <span className="font-medium">Type:</span> LLM
            </div>
            <div>
              <span className="font-medium">Status:</span> Available
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
