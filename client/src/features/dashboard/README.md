# Dashboard Feature

## Purpose
Provides the main dashboard interface, landing page, system overview, quick actions, and application statistics.

## Public Exports from index.ts
- **Components**: `Dashboard`, `Landing` - Main dashboard and landing page interfaces
- **Hooks**: `useDashboard` - Dashboard state management and data fetching
- **API**: `dashboardApi` - Dashboard-related API operations
- **Types**: `DashboardStats`, `QuickAction`, `RecentActivity`, `SystemHealth`, `DashboardState`

## Dependencies
- System health monitoring
- Activity tracking
- Shared UI components from `@/shared/components`

## Usage Example
```typescript
import { Dashboard, useDashboard, dashboardApi } from '@/features/dashboard';

// In a component
const { stats, quickActions, recentActivity, systemHealth } = useDashboard();
```

## Internal Structure
- `components/` - Dashboard UI, landing page, and demo components
- `hooks/` - Dashboard state management
- `api/` - Dashboard API integration
- `types.ts` - Dashboard-related types
- `index.ts` - Public API exports
