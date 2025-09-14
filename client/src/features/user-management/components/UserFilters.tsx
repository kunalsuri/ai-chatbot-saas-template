/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import React from 'react';
import { Search, UserCheck, UserX } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Role } from '@/features/auth';

interface UserFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: 'active' | 'inactive' | 'suspended' | 'pending' | 'all_statuses';
  setStatusFilter: (status: 'active' | 'inactive' | 'suspended' | 'pending' | 'all_statuses') => void;
  roleFilter: Role | 'all_roles';
  setRoleFilter: (role: Role | 'all_roles') => void;
  selectedUsers: string[];
  setSelectedUsers: (users: string[]) => void;
  onActivateUsers: () => void;
  onDeactivateUsers: () => void;
  refetch: () => void;
}

export function UserFilters({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  roleFilter,
  setRoleFilter,
  selectedUsers,
  setSelectedUsers,
  onActivateUsers,
  onDeactivateUsers,
  refetch
}: UserFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select 
              value={statusFilter} 
              onValueChange={(value: 'active' | 'inactive' | 'suspended' | 'pending' | 'all_statuses') => 
                setStatusFilter(value)
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_statuses">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select 
              value={roleFilter} 
              onValueChange={(value: Role | 'all_roles') => 
                setRoleFilter(value)
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_roles">All Roles</SelectItem>
                <SelectItem value="admin">Administrator</SelectItem>
                <SelectItem value="pro_user">Pro User</SelectItem>
                <SelectItem value="free_user">Free User</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {selectedUsers.length > 0 && (
            <div className="flex items-center justify-between bg-muted/50 p-2 rounded-md">
              <div className="text-sm">
                <span className="font-medium">{selectedUsers.length}</span> users selected
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onActivateUsers}
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  Activate
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onDeactivateUsers}
                >
                  <UserX className="w-4 h-4 mr-2" />
                  Deactivate
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedUsers([])}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
