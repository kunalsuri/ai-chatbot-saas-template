/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import React from 'react';
import { ChevronUp, ChevronDown, MoreHorizontal, Edit, Activity, Trash2, UserCheck, UserX, Shield } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/shared/components/ui/dropdown-menu';
import { CompleteUser } from '@/features/user-management';
import { Role, ROLE_DISPLAY_NAMES } from '@/features/auth';

interface UserTableProps {
  users: CompleteUser[];
  isLoading: boolean;
  selectedUsers: string[];
  sortBy: 'status' | 'plan' | 'createdAt' | 'lastLogin' | 'username' | 'email' | 'role';
  sortDirection: 'asc' | 'desc';
  onSelectUser: (userId: string, isSelected: boolean) => void;
  onSelectAll: (isSelected: boolean) => void;
  onEditUser: (user: CompleteUser) => void;
  onViewActivity: (userId: string) => void;
  onDeleteUser: (userId: string, username: string) => void;
  onChangeStatus?: (userId: string, status: 'active' | 'inactive' | 'suspended') => void;
  onSortChange: (column: 'status' | 'plan' | 'createdAt' | 'lastLogin' | 'username' | 'email' | 'role') => void;
}

export function UserTable({
  users,
  isLoading,
  selectedUsers,
  sortBy,
  sortDirection,
  onSelectUser,
  onSelectAll,
  onEditUser,
  onViewActivity,
  onDeleteUser,
  onChangeStatus,
  onSortChange
}: UserTableProps) {
  
  const getRoleBadgeVariant = (role: Role): 'default' | 'destructive' | 'secondary' | 'outline' => {
    const colorMap: Record<Role, 'default' | 'destructive' | 'secondary' | 'outline'> = {
      admin: 'destructive',
      pro_user: 'default',
      free_user: 'secondary',
    };
    return colorMap[role] || 'secondary';
  };

  const getStatusBadgeVariant = (status: string) => {
    const colorMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      inactive: 'secondary',
      suspended: 'destructive',
      pending: 'outline',
    };
    return colorMap[status] || 'secondary';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[30px]">
            <div className="flex items-center justify-center">
              <input 
                type="checkbox" 
                className="rounded border-gray-300"
                checked={users.length ? selectedUsers.length === users.length : false}
                onChange={(e) => {
                  onSelectAll(e.target.checked);
                }}
              />
            </div>
          </TableHead>
          <TableHead>User</TableHead>
          <TableHead>
            <div 
              className="flex items-center cursor-pointer"
              onClick={() => onSortChange('role')}
            >
              Role
              {sortBy === 'role' && (
                sortDirection === 'asc' ? 
                  <ChevronUp className="ml-1 h-4 w-4" /> : 
                  <ChevronDown className="ml-1 h-4 w-4" />
              )}
            </div>
          </TableHead>
          <TableHead>
            <div 
              className="flex items-center cursor-pointer"
              onClick={() => onSortChange('plan')}
            >
              Plan
              {sortBy === 'plan' && (
                sortDirection === 'asc' ? 
                  <ChevronUp className="ml-1 h-4 w-4" /> : 
                  <ChevronDown className="ml-1 h-4 w-4" />
              )}
            </div>
          </TableHead>
          <TableHead>
            <div 
              className="flex items-center cursor-pointer"
              onClick={() => onSortChange('status')}
            >
              Status
              {sortBy === 'status' && (
                sortDirection === 'asc' ? 
                  <ChevronUp className="ml-1 h-4 w-4" /> : 
                  <ChevronDown className="ml-1 h-4 w-4" />
              )}
            </div>
          </TableHead>
          <TableHead>
            <div 
              className="flex items-center cursor-pointer"
              onClick={() => onSortChange('createdAt')}
            >
              Created
              {sortBy === 'createdAt' && (
                sortDirection === 'asc' ? 
                  <ChevronUp className="ml-1 h-4 w-4" /> : 
                  <ChevronDown className="ml-1 h-4 w-4" />
              )}
            </div>
          </TableHead>
          <TableHead>
            <div 
              className="flex items-center cursor-pointer"
              onClick={() => onSortChange('lastLogin')}
            >
              Last Login
              {sortBy === 'lastLogin' && (
                sortDirection === 'asc' ? 
                  <ChevronUp className="ml-1 h-4 w-4" /> : 
                  <ChevronDown className="ml-1 h-4 w-4" />
              )}
            </div>
          </TableHead>
          <TableHead className="w-[70px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow 
            key={user.id}
            className={selectedUsers.includes(user.id) ? 'bg-muted/50' : undefined}
          >
            <TableCell>
              <div className="flex items-center justify-center">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-300"
                  checked={selectedUsers.includes(user.id)}
                  onChange={(e) => {
                    onSelectUser(user.id, e.target.checked);
                  }}
                />
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {user.name?.charAt(0) || user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{user.name || user.username}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={getRoleBadgeVariant(user.role || 'free_user')}>
                {ROLE_DISPLAY_NAMES[user.role || 'free_user']}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant="outline" className="capitalize">
                {user.plan}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={getStatusBadgeVariant(user.status)}>
                {user.status}
              </Badge>
            </TableCell>
            <TableCell>
              {new Date(user.createdAt).toLocaleDateString()}
            </TableCell>
            <TableCell>
              {user.lastLogin 
                ? new Date(user.lastLogin).toLocaleDateString()
                : 'Never'
              }
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onEditUser(user)}>
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onViewActivity(user.id)}>
                    <Activity className="mr-2 h-4 w-4" />
                    <span>Activity</span>
                  </DropdownMenuItem>
                  {onChangeStatus && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                      {user.status !== 'active' && (
                        <DropdownMenuItem onClick={() => onChangeStatus(user.id, 'active')}>
                          <UserCheck className="mr-2 h-4 w-4 text-green-600" />
                          <span>Activate</span>
                        </DropdownMenuItem>
                      )}
                      {user.status !== 'inactive' && (
                        <DropdownMenuItem onClick={() => onChangeStatus(user.id, 'inactive')}>
                          <UserX className="mr-2 h-4 w-4 text-gray-600" />
                          <span>Deactivate</span>
                        </DropdownMenuItem>
                      )}
                      {user.status !== 'suspended' && (
                        <DropdownMenuItem onClick={() => onChangeStatus(user.id, 'suspended')}>
                          <Shield className="mr-2 h-4 w-4 text-red-600" />
                          <span>Suspend</span>
                        </DropdownMenuItem>
                      )}
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onDeleteUser(user.id, user.username)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
