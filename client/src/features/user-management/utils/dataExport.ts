/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { CompleteUser } from '../types/user-management';

/**
 * Utility functions for exporting user data
 */

export interface ExportOptions {
  format: 'csv' | 'json' | 'xlsx';
  fields?: string[];
  filename?: string;
  includeHeaders?: boolean;
}

/**
 * Convert users array to CSV format
 */
export function convertToCSV(users: CompleteUser[], options: ExportOptions = {}): string {
  const {
    fields = ['username', 'email', 'name', 'role', 'plan', 'status', 'createdAt', 'lastLogin'],
    includeHeaders = true,
  } = options;

  const headers = fields.map(field => field.charAt(0).toUpperCase() + field.slice(1));
  const rows = users.map(user => 
    fields.map(field => {
      const value = (user as any)[field];
      if (value === null || value === undefined) return '';
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return String(value);
    })
  );

  const csvContent = [
    ...(includeHeaders ? [headers] : []),
    ...rows
  ].map(row => row.join(',')).join('\n');

  return csvContent;
}

/**
 * Convert users array to JSON format
 */
export function convertToJSON(users: CompleteUser[], options: ExportOptions = {}): string {
  const { fields } = options;
  
  const exportData = users.map(user => {
    if (fields) {
      const filteredUser: any = {};
      fields.forEach(field => {
        filteredUser[field] = (user as any)[field];
      });
      return filteredUser;
    }
    
    // Remove sensitive data for export
    const { password, twoFactorSecret, passwordResetToken, ...safeUser } = user as any;
    return safeUser;
  });

  return JSON.stringify(exportData, null, 2);
}

/**
 * Download file with given content
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Export users to CSV file
 */
export function exportToCSV(users: CompleteUser[], options: ExportOptions = {}): void {
  const filename = options.filename || `users-export-${new Date().toISOString().split('T')[0]}.csv`;
  const csvContent = convertToCSV(users, options);
  downloadFile(csvContent, filename, 'text/csv');
}

/**
 * Export users to JSON file
 */
export function exportToJSON(users: CompleteUser[], options: ExportOptions = {}): void {
  const filename = options.filename || `users-export-${new Date().toISOString().split('T')[0]}.json`;
  const jsonContent = convertToJSON(users, options);
  downloadFile(jsonContent, filename, 'application/json');
}

/**
 * Generate export statistics
 */
export function generateExportStats(users: CompleteUser[]) {
  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    inactiveUsers: users.filter(u => u.status === 'inactive').length,
    suspendedUsers: users.filter(u => u.status === 'suspended').length,
    pendingUsers: users.filter(u => u.status === 'pending').length,
    usersByRole: {} as Record<string, number>,
    usersByPlan: {} as Record<string, number>,
    exportDate: new Date().toISOString(),
  };

  // Count by role
  users.forEach(user => {
    const role = user.role || 'unknown';
    stats.usersByRole[role] = (stats.usersByRole[role] || 0) + 1;
  });

  // Count by plan
  users.forEach(user => {
    const plan = user.plan || 'unknown';
    stats.usersByPlan[plan] = (stats.usersByPlan[plan] || 0) + 1;
  });

  return stats;
}

/**
 * Export users with statistics
 */
export function exportWithStats(users: CompleteUser[], options: ExportOptions = {}): void {
  const stats = generateExportStats(users);
  const filename = options.filename || `users-export-with-stats-${new Date().toISOString().split('T')[0]}.json`;
  
  const exportData = {
    metadata: {
      exportDate: stats.exportDate,
      totalRecords: stats.totalUsers,
      exportedBy: 'User Management System',
      version: '1.0',
    },
    statistics: stats,
    users: convertToJSON(users, options),
  };

  downloadFile(JSON.stringify(exportData, null, 2), filename, 'application/json');
}

/**
 * Validate export data before processing
 */
export function validateExportData(users: CompleteUser[]): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!Array.isArray(users)) {
    errors.push('Users data must be an array');
    return { isValid: false, errors };
  }

  if (users.length === 0) {
    errors.push('No users to export');
    return { isValid: false, errors };
  }

  // Check for required fields
  const requiredFields = ['id', 'username', 'email'];
  users.forEach((user, index) => {
    requiredFields.forEach(field => {
      if (!(user as any)[field]) {
        errors.push(`User at index ${index} is missing required field: ${field}`);
      }
    });
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}