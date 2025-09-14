# User Management Feature

## Purpose
Handles all user-related operations including CRUD operations, user roles, permissions, and user profile management.

## Public Exports from index.ts
- **Components**: `UserManagement` - Main user management interface
- **Hooks**: `useUserManagement` - User state management and operations
- **API**: `userApi` - User-related API calls
- **Types**: `User`, `CreateUserRequest`, `UpdateUserRequest`, `UserFilters`, `UserManagementState`

## Dependencies
- React Query for state management
- Shared UI components from `@/shared/components`
- Shared hooks from `@/shared/hooks`

## Usage Example
```typescript
import { UserManagement, useUserManagement, userApi } from '@/features/user-management';

// In a component
const { users, createUser, updateUser, deleteUser } = useUserManagement();
```

## Internal Structure
- `components/` - React components for user management UI
- `hooks/` - Custom hooks for user operations
- `api/` - API integration functions
- `types.ts` - TypeScript interfaces and types
- `index.ts` - Public API exports
