/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import React, { useState, useCallback } from 'react';
import { Search, Filter, Download, Save, X, Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/shared/components/ui/dropdown-menu';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/shared/components/ui/dialog';
import { Label } from '@/shared/components/ui/label';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { CompleteUser } from '../types/user-management';
import { Role } from '@/features/auth';
import { useDebouncedSearch } from '../hooks/useDebounce';
import { useFuzzySearch, useSavedSearches } from '../hooks/useFuzzySearch';
import { exportToCSV, exportToJSON, exportWithStats } from '../utils/dataExport';

interface EnhancedUserFiltersProps {
  users: CompleteUser[];
  onFilteredUsersChange: (users: CompleteUser[]) => void;
  selectedUsers: string[];
  onBulkAction: (action: 'activate' | 'deactivate' | 'export') => void;
  className?: string;
}

interface FilterState {
  status: string[];
  role: string[];
  plan: string[];
  dateRange: {
    from?: Date;
    to?: Date;
  };
}

/**
 * Enhanced User Filters with Advanced Search and Export
 */
export function EnhancedUserFilters({
  users,
  onFilteredUsersChange,
  selectedUsers,
  onBulkAction,
  className,
}: EnhancedUserFiltersProps) {
  const { searchValue, setSearchValue, debouncedValue, isSearching } = useDebouncedSearch('', 300);
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    role: [],
    plan: [],
    dateRange: {},
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [saveSearchDialog, setSaveSearchDialog] = useState(false);
  const [searchName, setSearchName] = useState('');

  const { savedSearches, saveSearch, deleteSearch } = useSavedSearches();
  const { filteredUsers, searchResults } = useFuzzySearch(users, debouncedValue);

  // Apply additional filters to fuzzy search results
  const finalFilteredUsers = React.useMemo(() => {
    let result = filteredUsers;

    // Status filter
    if (filters.status.length > 0) {
      result = result.filter(user => filters.status.includes(user.status));
    }

    // Role filter
    if (filters.role.length > 0) {
      result = result.filter(user => filters.role.includes(user.role || 'free_user'));
    }

    // Plan filter
    if (filters.plan.length > 0) {
      result = result.filter(user => filters.plan.includes(user.plan));
    }

    // Date range filter
    if (filters.dateRange.from || filters.dateRange.to) {
      result = result.filter(user => {
        const userDate = new Date(user.createdAt);
        if (filters.dateRange.from && userDate < filters.dateRange.from) return false;
        if (filters.dateRange.to && userDate > filters.dateRange.to) return false;
        return true;
      });
    }

    return result;
  }, [filteredUsers, filters]);

  React.useEffect(() => {
    onFilteredUsersChange(finalFilteredUsers);
  }, [finalFilteredUsers, onFilteredUsersChange]);

  const handleFilterChange = useCallback((filterType: keyof FilterState, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value,
    }));
  }, []);

  const toggleFilter = useCallback((filterType: 'status' | 'role' | 'plan', value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter(v => v !== value)
        : [...prev[filterType], value],
    }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearchValue('');
    setFilters({
      status: [],
      role: [],
      plan: [],
      dateRange: {},
    });
  }, [setSearchValue]);

  const handleSaveSearch = useCallback(() => {
    if (searchName.trim()) {
      saveSearch(searchName.trim(), debouncedValue, filters);
      setSaveSearchDialog(false);
      setSearchName('');
    }
  }, [searchName, debouncedValue, filters, saveSearch]);

  const loadSavedSearch = useCallback((search: any) => {
    setSearchValue(search.query);
    setFilters(search.filters);
  }, [setSearchValue]);

  const getActiveFilterCount = () => {
    return filters.status.length + filters.role.length + filters.plan.length + 
           (filters.dateRange.from || filters.dateRange.to ? 1 : 0);
  };

  const handleExport = (format: 'csv' | 'json' | 'stats') => {
    const exportUsers = selectedUsers.length > 0 
      ? finalFilteredUsers.filter(user => selectedUsers.includes(user.id))
      : finalFilteredUsers;

    switch (format) {
      case 'csv':
        exportToCSV(exportUsers);
        break;
      case 'json':
        exportToJSON(exportUsers);
        break;
      case 'stats':
        exportWithStats(exportUsers);
        break;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users by name, email, username..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-10 pr-10"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
          {searchValue && !isSearching && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchValue('')}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          {/* Advanced Filters */}
          <Button
            variant="outline"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="relative"
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                {getActiveFilterCount()}
              </Badge>
            )}
          </Button>

          {/* Saved Searches */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Save className="mr-2 h-4 w-4" />
                Saved
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Saved Searches</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {savedSearches.length === 0 ? (
                <DropdownMenuItem disabled>No saved searches</DropdownMenuItem>
              ) : (
                savedSearches.map((search) => (
                  <DropdownMenuItem
                    key={search.name}
                    onClick={() => loadSavedSearch(search)}
                    className="flex justify-between"
                  >
                    <span>{search.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSearch(search.name);
                      }}
                      className="h-4 w-4 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </DropdownMenuItem>
                ))
              )}
              <DropdownMenuSeparator />
              <Dialog open={saveSearchDialog} onOpenChange={setSaveSearchDialog}>
                <DialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    Save Current Search
                  </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Save Search</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="search-name">Search Name</Label>
                      <Input
                        id="search-name"
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        placeholder="Enter a name for this search..."
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setSaveSearchDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveSearch} disabled={!searchName.trim()}>
                        Save
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Export */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                Export {selectedUsers.length > 0 ? `${selectedUsers.length} selected` : 'all'} users
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleExport('csv')}>
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('json')}>
                Export as JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('stats')}>
                Export with Statistics
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <div className="border rounded-lg p-4 space-y-4 bg-muted/20">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Advanced Filters</h3>
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              Clear All
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <Label className="text-sm font-medium">Status</Label>
              <div className="space-y-2 mt-2">
                {['active', 'inactive', 'suspended', 'pending'].map((status) => (
                  <div key={status} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${status}`}
                      checked={filters.status.includes(status)}
                      onCheckedChange={() => toggleFilter('status', status)}
                    />
                    <Label htmlFor={`status-${status}`} className="capitalize text-sm">
                      {status}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Role Filter */}
            <div>
              <Label className="text-sm font-medium">Role</Label>
              <div className="space-y-2 mt-2">
                {['admin', 'pro_user', 'free_user'].map((role) => (
                  <div key={role} className="flex items-center space-x-2">
                    <Checkbox
                      id={`role-${role}`}
                      checked={filters.role.includes(role)}
                      onCheckedChange={() => toggleFilter('role', role)}
                    />
                    <Label htmlFor={`role-${role}`} className="text-sm">
                      {role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Plan Filter */}
            <div>
              <Label className="text-sm font-medium">Plan</Label>
              <div className="space-y-2 mt-2">
                {['free', 'pro', 'premium', 'enterprise'].map((plan) => (
                  <div key={plan} className="flex items-center space-x-2">
                    <Checkbox
                      id={`plan-${plan}`}
                      checked={filters.plan.includes(plan)}
                      onCheckedChange={() => toggleFilter('plan', plan)}
                    />
                    <Label htmlFor={`plan-${plan}`} className="capitalize text-sm">
                      {plan}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {(getActiveFilterCount() > 0 || debouncedValue) && (
        <div className="flex flex-wrap gap-2">
          {debouncedValue && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: "{debouncedValue}"
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => setSearchValue('')}
              />
            </Badge>
          )}
          
          {filters.status.map(status => (
            <Badge key={`status-${status}`} variant="secondary" className="flex items-center gap-1">
              Status: {status}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => toggleFilter('status', status)}
              />
            </Badge>
          ))}
          
          {filters.role.map(role => (
            <Badge key={`role-${role}`} variant="secondary" className="flex items-center gap-1">
              Role: {role.replace('_', ' ')}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => toggleFilter('role', role)}
              />
            </Badge>
          ))}
          
          {filters.plan.map(plan => (
            <Badge key={`plan-${plan}`} variant="secondary" className="flex items-center gap-1">
              Plan: {plan}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => toggleFilter('plan', plan)}
              />
            </Badge>
          ))}
        </div>
      )}

      {/* Results Summary */}
      <div className="text-sm text-muted-foreground">
        Showing {finalFilteredUsers.length} of {users.length} users
        {selectedUsers.length > 0 && ` (${selectedUsers.length} selected)`}
      </div>
    </div>
  );
}