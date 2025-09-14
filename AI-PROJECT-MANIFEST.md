# Project Manifest for AI Agents

## 1. Project Metadata

**Name:** AI ChatBot SaaS  
**Description:** Production-ready SaaS AI chatbot platform with Feature-Driven Development architecture. Supports local LLMs (Ollama, LM Studio) and cloud providers (Google AI, OpenAI, Anthropic, Mistral) with real-time chat, advanced UI, and enterprise security.  
**Tech Stack:** TypeScript, React 18.3.1, Express.js, Tailwind CSS 3.4.17, TanStack Query v5  
**Architecture Pattern:** Feature-Driven Development (FDD) - Each feature is self-contained with its own components, services, types, and routes  
**Frameworks/Libraries:** 
- Frontend: React, Wouter (routing), Radix UI, Framer Motion, TanStack Query v5
- Backend: Express.js, Winston (logging), Feature-based organization  
  - Optional: Drizzle ORM + PostgreSQL (future/optional)
- AI: LM Studio, Ollama (local-first), Google Gemini, Anthropic Claude, OpenAI, Mistral
- Validation: Zod, React Hook Form
- UI/UX: Advanced animations, PWA capabilities, performance monitoring

**Dependencies:** Modern React/TypeScript stack with Radix UI, Framer Motion, AI SDKs, security middleware, and feature-based architecture  
**Build/Deploy System:** Vite + ESBuild with optimized server bundling, npm scripts for dev/build/start

## 2. Architecture Overview

**Architecture Pattern:** Feature-Driven Development (FDD) - Each feature is self-contained with its own components, services, types, and routes for maximum maintainability and scalability.

**Entrypoints:**
- `server/index.ts` → Express server with middleware stack and feature route registration
- `client/src/App.tsx` → React application with lazy-loaded feature routing
- `client/index.html` → Vite-served frontend with PWA capabilities

**Feature-Based Organization:**

**Server Features (`server/features/`):**
- `auth/` → Authentication, RBAC, session management
  - `routes/`, `services/`, `types/`, `middleware/`
- `chat/` → Real-time chat functionality
  - `routes/`, `services/`, `types/`
- `model-management/` → AI provider services and model management
  - `routes/`, `services/` (google-ai, ollama, lmstudio, external-ai-*), `types/`
- `translation/` → Translation services and history
  - `routes/`, `services/`, `types/`
- `user-management/` → User CRUD operations
  - `routes/`, `services/`, `types/`
- `prompt-improver/` → Prompt enhancement services
  - `routes/`, `services/`, `types/`

**Client Features (`client/src/features/`):**
- `auth/` → Authentication components, guards, hooks
  - `components/`, `hooks/`, `utils/`, `types/`
- `dashboard/` → Dashboard components and analytics
  - `components/`, `hooks/`, `utils/`
- `chat/` → Chat interface and real-time communication
  - `components/`, `hooks/`, `utils/`
- `model-management/` → AI model configuration and switching
  - `components/`, `hooks/`, `utils/`

**Shared Infrastructure:**
- `server/shared/` → Cross-cutting server concerns (middleware, config, utils)
- `client/src/components/ui/` → Reusable UI components (Radix UI + Tailwind)
- `client/src/lib/` → Shared client utilities (API client, query client)
- `shared/` → Cross-platform types, schemas, validation

**FDD Folder Structure:**
```
├── client/src/
│   ├── features/           # Feature-based organization
│   │   ├── auth/           # Authentication & RBAC
│   │   ├── dashboard/      # Dashboard components
│   │   ├── chat/           # Chat functionality
│   │   └── model-management/ # AI model management
│   ├── components/ui/      # Shared UI components
│   ├── lib/               # Shared utilities
│   └── pages/             # Route components
├── server/
│   ├── features/          # Feature-based server organization
│   │   ├── auth/          # Authentication services
│   │   ├── chat/          # Chat API endpoints
│   │   ├── model-management/ # AI provider services
│   │   └── translation/   # Translation services
│   └── shared/           # Shared server infrastructure
├── shared/               # Cross-cutting types and schemas
├── data/                 # JSON data files
└── docs/                 # Documentation
```

## 3. API Surface

**Core Functions / Classes:**
- `registerSummaryRoutes()`, `registerTranslationRoutes()`, etc. → Per-module route registration
- `generateChatResponse()` / `generateLMStudioResponse()` → AI chat/summary generation
- Translation service and prompt improver service functions
- Local JSON storage helpers (read/write in `data/*.json`)
- `validateEnvironment()` (in `shared/env-validation.ts`) → Environment validation

**Feature-Based API Endpoints:**
- **Auth Feature:** `/api/auth/*` (session, login, logout, RBAC)
- **Chat Feature:** `/api/chat/*` (real-time chat, history, streaming)
- **Model Management:** `/api/model-management/*` (providers, models, health checks)
  - Local: `/api/model-management/ollama/*`, `/api/model-management/lmstudio/*`
  - External: `/api/model-management/external/*` (Google AI, Anthropic, OpenAI, Mistral)
- **Translation Feature:** `/api/translation/*` (translate, history, languages)
- **User Management:** `/api/user-management/*` (CRUD, roles, permissions)
- **Prompt Improver:** `/api/prompt-improver/*` (enhance, history, templates)
- **Summary Feature:** `/api/summary/*` (generate, history, management)
- **User Activity:** `/api/user-activity/*` (tracking, analytics, logs)

## 4. Conventions

**Naming Rules:**
- PascalCase for components, types, schemas
- camelCase for functions, variables
- kebab-case for file names and routes
- SCREAMING_SNAKE_CASE for environment variables

**Type System:**
- Strict TypeScript with `noEmit: true`
- Zod schemas for runtime validation (`shared/validation.ts`)
- API response and domain types in `shared/types/*`

**Linting/Config Notes:**
- ESNext modules
- Path aliases: `@shared/*` → `shared/*` (and project-level aliases where applicable)
- Strict mode enabled with comprehensive type checking

**Testing Framework & Coverage Goals:** Not currently implemented  
**CI/CD Notes:** Manual deployment, environment-specific configuration

## 5. Critical Rules

- **Do not modify authentication middleware** without updating CSRF protection and session management
- **Security constraints:** All state-changing endpoints require CSRF tokens, authentication middleware on protected routes
- **Performance invariants:** AI operations have 15s timeout thresholds, request logging with performance monitoring
- **Environment validation:** Server fails to start with invalid configuration, strict Zod validation required

## 6. Extension Guidelines

**Adding new features (FDD Pattern):**
1. **Server-side feature creation:**
   - Create feature directory: `server/features/<feature-name>/`
   - Add subdirectories: `routes/`, `services/`, `types/`, `middleware/` (if needed)
   - Create Zod schemas in `server/features/<feature>/types/`
   - Implement routes with `requireAuth` + `csrfProtection` where needed
   - Register feature routes in `server/routes.ts`

2. **Client-side feature creation:**
   - Create feature directory: `client/src/features/<feature-name>/`
   - Add subdirectories: `components/`, `hooks/`, `utils/`, `types/`
   - Create feature-specific API hooks using TanStack Query
   - Implement React components with proper TypeScript types
   - Add lazy-loaded routes in main router

3. **Shared types and validation:**
   - Add cross-platform types in `shared/types/`
   - Create validation schemas in `shared/validation.ts`
   - Ensure type safety across client-server boundary

4. **Integration:**
   - Add navigation items to sidebar/menu
   - Implement proper error boundaries and loading states
   - Add comprehensive logging with structured data
   - Update documentation and tests

**Extending APIs/components:**
- Follow existing patterns in `server/services/` for business logic
- Use React Query for client-side state management
- Implement proper loading states and error boundaries
- Add comprehensive logging with structured data

**Reuse patterns:**
- Authentication: `requireAuth` middleware + session management
- Validation: Zod schemas with `validateBody/validateParams`
- UI: Radix UI components with Tailwind styling
- State: React Context + React Query for server state

## 7. Current Limitations / TODOs

**Current Status:**
- ✅ Complete Feature-Driven Development architecture
- ✅ 8 fully implemented features (auth, chatbot, dashboard, model-management, etc.)
- ✅ Google AI Studio integration with 40+ models
- ✅ Local LLM support (Ollama, LM Studio) with real-time health monitoring
- ✅ Modern React 18 with TypeScript strict mode and TanStack Query v5
- ✅ Advanced UI with Radix UI, Tailwind CSS, and Framer Motion
- ✅ PWA capabilities with offline support and install prompts
- ✅ Production-ready authentication with RBAC and CSRF protection
- ✅ Comprehensive documentation updated for FDD pattern

**Architecture Benefits:**
- 🏗️ Easy feature addition with standardized patterns
- 🔄 Self-contained features with independent development
- 📦 Simple storage with JSON files (PostgreSQL optional)
- 🚀 Zero-configuration startup for immediate development
- 🔒 Enterprise-grade security with session management

**Development Experience:**
- 3-minute setup: `git clone → npm install → npm run dev`
- Hot reload for all features with Vite
- Type-safe APIs with end-to-end TypeScript
- Feature-specific logging and error handling
- Consistent patterns across all features
