# Authentication Feature

## Purpose
Manages user authentication, authorization, login/logout flows, and session management.

## Public Exports from index.ts
- **Components**: `Login`, `AuthProvider` - Authentication UI and context provider
- **Hooks**: `useAuth` - Authentication state and operations
- **API**: `authApi` - Authentication-related API calls
- **Types**: `AuthUser`, `LoginCredentials`, `SignupCredentials`, `AuthState`, `AuthResponse`

## Dependencies
- React Context for state management
- Shared UI components from `@/shared/components`
- JWT token handling

## Usage Example
```typescript
import { Login, useAuth, authApi } from '@/features/auth';

// In a component
const { user, login, logout, isAuthenticated } = useAuth();
```

## Internal Structure
- `components/` - Login form and authentication UI
- `hooks/` - Authentication state management
- `api/` - Authentication API integration
- `types.ts` - Authentication-related types
- `index.ts` - Public API exports
