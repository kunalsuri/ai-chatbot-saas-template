# Model Management Feature

## Purpose
Handles local and external AI model management including discovery, testing, downloading, health monitoring, and provider management.

## Public Exports from index.ts
- **Components**: `LocalModelManagement`, `ExternalModelManagement` - Model management interfaces
- **Hooks**: `useExternalModelManagement` - Model management state and operations
- **API**: `modelManagementApi` - Model management API integration
- **Types**: `AIModel`, `ModelProvider`, `ModelTestRequest`, `ModelTestResponse`, `ModelDownloadProgress`, `ModelManagementState`

## Dependencies
- Provider health check systems
- Model testing infrastructure
- Shared UI components from `@/shared/components`

## Usage Example
```typescript
import { LocalModelManagement, useExternalModelManagement, modelManagementApi } from '@/features/model-management';

// In a component
const { providers, models, testModel, downloadModel } = useExternalModelManagement();
```

## Internal Structure
- `components/` - Model management UI and provider interfaces
- `hooks/` - Model management state and operations
- `api/` - Model management API integration
- `types.ts` - Model and provider types
- `index.ts` - Public API exports
