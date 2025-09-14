/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import React from 'react';
import { Button } from '@/shared/components/ui/button';

interface UserPaginationProps {
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  totalItems: number;
  totalPages: number;
  isLoading: boolean;
}

export function UserPagination({
  currentPage,
  setCurrentPage,
  pageSize,
  setPageSize,
  totalItems,
  totalPages,
  isLoading
}: UserPaginationProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-2">
      <div className="text-sm text-muted-foreground">
        Showing <span className="font-medium">{((currentPage - 1) * pageSize) + 1}</span> to{" "}
        <span className="font-medium">
          {Math.min(currentPage * pageSize, totalItems)}
        </span>{" "}
        of <span className="font-medium">{totalItems}</span> users
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <select
            className="h-8 w-16 rounded-md border border-input bg-transparent px-2 py-1 text-sm"
            value={pageSize}
            onChange={(e) => {
              const newLimit = parseInt(e.target.value, 10);
              setCurrentPage(1); // Reset to first page when changing page size
              setPageSize(newLimit);
            }}
          >
            {[10, 20, 30, 40, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {currentPage} of {totalPages || 1}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1 || isLoading}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages || 1))}
            disabled={currentPage === (totalPages || 1) || isLoading}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
