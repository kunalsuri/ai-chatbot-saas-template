/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Monitor } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { usePWA } from '@/hooks/use-pwa';

interface InstallPromptProps {
  onDismiss?: () => void;
}

export function InstallPrompt({ onDismiss }: InstallPromptProps) {
  const { canInstall, installApp, isStandalone } = usePWA();

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      onDismiss?.();
    }
  };

  if (!canInstall || isStandalone) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
      >
        <Card className="p-4 bg-background/95 backdrop-blur-sm border shadow-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg">
              <Download className="h-5 w-5 text-primary" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm mb-1">
                Install AI ChatBot SaaS
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                Get the full app experience with offline access and faster loading.
              </p>
              
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Smartphone className="h-3 w-3" />
                  <span>Mobile</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Monitor className="h-3 w-3" />
                  <span>Desktop</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleInstall}
                  className="flex-1"
                >
                  Install App
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onDismiss}
                  className="px-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

// Offline indicator component
export function OfflineIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
    >
      <div className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
        You're offline - some features may be limited
      </div>
    </motion.div>
  );
}
