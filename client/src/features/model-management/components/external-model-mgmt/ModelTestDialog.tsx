/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';
import { ExternalProvider } from '../../types';
import { Copy, CheckCircle, Clock, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModelTestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  provider: ExternalProvider | null;
  model: string | null;
  testMessage: string;
  onTestMessageChange: (message: string) => void;
  onTest: () => void;
  isTestingModel: boolean;
  testResult: any;
  testError: Error | null;
}

export function ModelTestDialog({
  isOpen,
  onClose,
  provider,
  model,
  testMessage,
  onTestMessageChange,
  onTest,
  isTestingModel,
  testResult,
  testError,
}: ModelTestDialogProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const formatResponseTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>Test Model</span>
            {provider && model && (
              <Badge variant="outline" className="text-xs">
                {provider} / {model}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Send a test message to evaluate the model's response quality and performance.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Input Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Test Message</label>
            <Textarea
              value={testMessage}
              onChange={(e) => onTestMessageChange(e.target.value)}
              placeholder="Enter a message to test the model..."
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Test Button */}
          <Button
            onClick={onTest}
            disabled={isTestingModel || !testMessage.trim()}
            className="w-full"
          >
            {isTestingModel ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="mr-2"
              >
                <Zap className="h-4 w-4" />
              </motion.div>
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            {isTestingModel ? 'Testing Model...' : 'Test Model'}
          </Button>

          {/* Results Section */}
          <AnimatePresence mode="wait">
            {testResult?.data && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Response</h3>
                  <div className="flex items-center space-x-2">
                    {testResult.data.responseTime && (
                      <Badge variant="secondary" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatResponseTime(testResult.data.responseTime)}
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(testResult.data.result.content)}
                      className="h-8 px-2"
                    >
                      {copied ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>

                <Card>
                  <CardContent className="p-4">
                    <div className="whitespace-pre-wrap text-sm">
                      {testResult.data.result.content}
                    </div>
                  </CardContent>
                </Card>

                {/* Usage Statistics */}
                {testResult.data.result.usage && (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-2 bg-muted rounded-md">
                      <div className="text-xs text-muted-foreground">Prompt</div>
                      <div className="font-medium">
                        {testResult.data.result.usage.promptTokens}
                      </div>
                    </div>
                    <div className="text-center p-2 bg-muted rounded-md">
                      <div className="text-xs text-muted-foreground">Completion</div>
                      <div className="font-medium">
                        {testResult.data.result.usage.completionTokens}
                      </div>
                    </div>
                    <div className="text-center p-2 bg-muted rounded-md">
                      <div className="text-xs text-muted-foreground">Total</div>
                      <div className="font-medium">
                        {testResult.data.result.usage.totalTokens}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {testError && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="border-red-200 dark:border-red-800">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-2">
                      <div className="text-red-500 mt-0.5">⚠️</div>
                      <div>
                        <div className="font-medium text-red-700 dark:text-red-300">
                          Test Failed
                        </div>
                        <div className="text-sm text-red-600 dark:text-red-400 mt-1">
                          {testError.message}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
