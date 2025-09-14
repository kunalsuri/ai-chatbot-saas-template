/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import React, { Suspense, ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { motion } from 'framer-motion';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';

interface AsyncBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  name?: string;
}

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  name?: string;
}

function ErrorFallback({ error, resetErrorBoundary, name }: ErrorFallbackProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-destructive/20 bg-destructive/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            {name ? `${name} Error` : 'Something went wrong'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {error.message || 'An unexpected error occurred'}
          </p>
          <Button
            onClick={resetErrorBoundary}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function LoadingFallback({ name }: { name?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-center p-8"
    >
      <div className="text-center space-y-4">
        <div className="relative">
          <motion.div
            className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full mx-auto"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
        {name && (
          <p className="text-sm text-muted-foreground">
            Loading {name}...
          </p>
        )}
      </div>
    </motion.div>
  );
}

export function AsyncBoundary({ children, fallback, name }: AsyncBoundaryProps) {
  return (
    <ErrorBoundary
      FallbackComponent={(props) => <ErrorFallback {...props} name={name} />}
      onError={(error, errorInfo) => {
        // Log error for monitoring
        console.error(`AsyncBoundary Error in ${name}:`, error, errorInfo);
      }}
    >
      <Suspense fallback={fallback || <LoadingFallback name={name} />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}
