# Chatbot Feature

## Purpose
Provides AI chatbot functionality for both local and external AI providers with conversation management, streaming, and model switching.

## Public Exports from index.ts
- **Components**: `AIChatBotLocal`, `AIChatBotExternal` - Chat interfaces for different AI providers
- **Hooks**: `useExternalAI` - External AI state management
- **API**: `chatApi` - Chat-related API operations
- **Types**: `ChatMessage`, `ChatSession`, `ChatProvider`, `ChatModel`, `ChatRequest`, `ChatResponse`, `ChatState`

## Dependencies
- React Query for state management
- WebSocket/SSE for streaming responses
- Shared UI components from `@/shared/components`

## Usage Example
```typescript
import { AIChatBotLocal, useExternalAI, chatApi } from '@/features/chatbot';

// In a component
const { sendMessage, sessions, currentSession } = useExternalAI();
```

## Internal Structure
- `components/` - Chat UI components and interfaces
- `hooks/` - Chat state management and operations
- `api/` - Chat API integration
- `types.ts` - Chat-related types and interfaces
- `index.ts` - Public API exports
