# Settings Feature

## Purpose
Manages application settings, configuration for local AI providers (Ollama, LM Studio), external AI providers, and user preferences.

## Public Exports from index.ts
- **Components**: `Settings` - Main settings interface
- **Hooks**: `useOllamaConfig`, `useLMStudioConfig` - Provider configuration management
- **API**: `settingsApi` - Settings-related API operations
- **Types**: `AppSettings`, `OllamaConfig`, `LMStudioConfig`, `ExternalAIConfig`, `SettingsState`

## Dependencies
- Provider health check systems
- Shared UI components from `@/shared/components`
- Configuration persistence

## Usage Example
```typescript
import { Settings, useOllamaConfig, settingsApi } from '@/features/settings';

// In a component
const { config, updateConfig, testConnection } = useOllamaConfig();
```

## Internal Structure
- `components/` - Settings UI and provider configuration
- `hooks/` - Settings state management
- `api/` - Settings API integration
- `types.ts` - Settings and configuration types
- `index.ts` - Public API exports
