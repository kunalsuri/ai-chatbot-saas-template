/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { Suspense } from 'react';
import { PageSkeleton, DashboardSkeleton, FormSkeleton, ListSkeleton } from './PageSkeleton';

interface SuspenseFallbackProps {
  type?: 'page' | 'dashboard' | 'form' | 'list';
  children: React.ReactNode;
}

export function SuspenseFallback({ type = 'page', children }: SuspenseFallbackProps) {
  const getFallback = () => {
    switch (type) {
      case 'dashboard':
        return <DashboardSkeleton />;
      case 'form':
        return <FormSkeleton />;
      case 'list':
        return <ListSkeleton />;
      default:
        return <PageSkeleton />;
    }
  };

  return (
    <Suspense fallback={getFallback()}>
      {children}
    </Suspense>
  );
}

export function RouteLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        <p className="text-gray-600 dark:text-gray-300">Loading page...</p>
      </div>
    </div>
  );
}
