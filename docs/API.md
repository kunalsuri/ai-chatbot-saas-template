# API Documentation

## Overview

Feature-driven REST API with consistent patterns across all endpoints. Each feature has its own API namespace with standardized CRUD operations, authentication, and validation.

## Base URLs

- **Development**: `http://localhost:5000`
- **Production**: `https://your-domain.com`

## Feature-Based API Structure

All API endpoints follow the pattern: `/api/{feature-name}/{operation}`

```
/api/auth/*              # Authentication & session management
/api/chat/*              # Chat functionality
/api/model-management/*  # AI provider management
/api/translation/*       # Translation services
/api/prompt-improver/*   # Prompt enhancement
/api/user-management/*   # User operations
/api/templates/*         # Template management
```

## Authentication Feature (`/api/auth/*`)

### Get CSRF Token
```http
GET /api/auth/csrf-token
```

**Response**
```json
{
  "success": true,
  "data": {
    "csrfToken": "your-csrf-token"
  },
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json
X-CSRF-Token: your-csrf-token
```

**Request**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "role": "user|admin",
      "plan": "free|pro|enterprise"
    }
  },
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

### Get Current User
```http
GET /api/auth/me
```

### Logout
```http
POST /api/auth/logout
X-CSRF-Token: your-csrf-token
```

### Register (if enabled)
```http
POST /api/auth/register
Content-Type: application/json
X-CSRF-Token: your-csrf-token
```

## Chat Feature (`/api/chat/*`)

### Send Message
```http
POST /api/chat/send
Content-Type: application/json
X-CSRF-Token: your-csrf-token
```

**Request**
```json
{
  "message": "Hello, how are you?",
  "sessionId": "optional-session-id",
  "provider": "ollama|lmstudio|google-ai|openai",
  "model": "llama3.1|gpt-4|gemini-pro"
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "message": "I'm doing well, thank you!",
    "sessionId": "session-id",
    "messageId": "msg-123",
    "tokensUsed": 42,
    "provider": "ollama",
    "model": "llama3.1"
  },
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

### Get Chat History
```http
GET /api/chat/history?sessionId=session-id&limit=50&offset=0
```

### Get Chat Sessions
```http
GET /api/chat/sessions
```

### Create New Session
```http
POST /api/chat/sessions
X-CSRF-Token: your-csrf-token
```

### Delete Session
```http
DELETE /api/chat/sessions/{sessionId}
X-CSRF-Token: your-csrf-token
```

## Model Management Feature (`/api/model-management/*`)

### Get All Providers
```http
GET /api/model-management/providers
```

**Response**
```json
{
  "success": true,
  "data": {
    "providers": [
      {
        "id": "ollama",
        "name": "Ollama",
        "type": "local",
        "status": "healthy",
        "modelCount": 3,
        "endpoint": "http://localhost:11434"
      },
      {
        "id": "google-ai",
        "name": "Google AI Studio",
        "type": "external",
        "status": "healthy",
        "modelCount": 15,
        "requiresApiKey": true
      }
    ]
  }
}
```

### Get Provider Models
```http
GET /api/model-management/providers/{providerId}/models
```

### Test Provider Connection
```http
POST /api/model-management/providers/{providerId}/test
X-CSRF-Token: your-csrf-token
```

### Test Model
```http
POST /api/model-management/providers/{providerId}/models/{modelId}/test
Content-Type: application/json
X-CSRF-Token: your-csrf-token
```

**Request**
```json
{
  "message": "Hello, this is a test message",
  "apiKey": "optional-for-external-providers"
}
```

## Translation Feature (`/api/translation/*`)

### Translate Text
```http
POST /api/translation/translate
Content-Type: application/json
X-CSRF-Token: your-csrf-token
```

**Request**
```json
{
  "text": "Hello, world!",
  "targetLanguage": "es",
  "sourceLanguage": "en",
  "provider": "google-ai"
}
```

### Get Translation History
```http
GET /api/translation/history?limit=20&offset=0
```

### Get Supported Languages
```http
GET /api/translation/languages
```

## Prompt Improver Feature (`/api/prompt-improver/*`)

### Improve Prompt
```http
POST /api/prompt-improver/improve
Content-Type: application/json
X-CSRF-Token: your-csrf-token
```

**Request**
```json
{
  "prompt": "Write a story",
  "provider": "google-ai",
  "improvementType": "clarity|creativity|specificity"
}
```

### Get Improvement History
```http
GET /api/prompt-improver/history
```

## Templates Feature (`/api/templates/*`)

### Get Templates
```http
GET /api/templates?category=chat&limit=10
```

### Create Template
```http
POST /api/templates
Content-Type: application/json
X-CSRF-Token: your-csrf-token
```

### Update Template
```http
PUT /api/templates/{templateId}
X-CSRF-Token: your-csrf-token
```

### Delete Template
```http
DELETE /api/templates/{templateId}
X-CSRF-Token: your-csrf-token
```

## Standard Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data here
  },
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": "Additional error details",
    "field": "fieldName" // For validation errors
  },
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

### Common Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `AUTH_REQUIRED` | Authentication is required | 401 |
| `INVALID_CREDENTIALS` | Invalid username or password | 401 |
| `FORBIDDEN` | Insufficient permissions | 403 |
| `NOT_FOUND` | Resource not found | 404 |
| `VALIDATION_ERROR` | Request validation failed | 400 |
| `RATE_LIMIT_EXCEEDED` | Too many requests | 429 |
| `PROVIDER_ERROR` | AI provider error | 502 |
| `INTERNAL_SERVER_ERROR` | Server error | 500 |

## Rate Limiting

Feature-specific rate limits to ensure fair usage:

| Feature | Endpoint Pattern | Limit | Window |
|---------|------------------|-------|--------|
| Auth | `/api/auth/login` | 5 requests | 15 minutes |
| Auth | `/api/auth/register` | 3 requests | 1 hour |
| Chat | `/api/chat/*` | 60 requests | 1 minute |
| Model Management | `/api/model-management/*/test` | 10 requests | 1 minute |
| Translation | `/api/translation/translate` | 30 requests | 1 minute |
| Prompt Improver | `/api/prompt-improver/improve` | 20 requests | 1 minute |
| Templates | `/api/templates/*` | 100 requests | 1 minute |

**Rate Limit Headers:**
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1640995200
```

## Real-time Features

### WebSocket Connection
```
ws://localhost:5000/api/ws
```

**Authentication:** Include session cookie in WebSocket handshake

### Event Types

#### Chat Message Streaming
```json
{
  "type": "chat:message:chunk",
  "data": {
    "sessionId": "session-123",
    "messageId": "msg-456",
    "chunk": "Hello there!",
    "isComplete": false
  }
}
```

#### Model Status Updates
```json
{
  "type": "model:status:update",
  "data": {
    "providerId": "ollama",
    "status": "healthy|unhealthy|loading",
    "modelCount": 3
  }
}
```

#### Error Events
```json
{
  "type": "error",
  "error": {
    "code": "WEBSOCKET_ERROR",
    "message": "Connection error"
  }
}
```

## Authentication & Security

### Required Headers
```http
Content-Type: application/json
X-CSRF-Token: your-csrf-token  // For state-changing operations
Cookie: session=your-session   // Automatically included by browser
```

### CSRF Protection
All `POST`, `PUT`, `DELETE` requests require a CSRF token:
1. Get token from `/api/auth/csrf-token`
2. Include in `X-CSRF-Token` header
3. Token is valid for the session duration

### Session Management
- Sessions use HTTP-only cookies
- Automatic session renewal on activity
- 24-hour session timeout
- Secure cookie attributes in production

## Feature Development

### Adding New API Endpoints

1. **Create feature route file:**
   ```typescript
   // server/features/my-feature/routes/index.ts
   export function registerMyFeatureRoutes(app: Express) {
     const router = Router();
     
     router.get('/', requireAuth, getMyFeatureData);
     router.post('/', requireAuth, csrfProtection, createMyFeatureData);
     
     app.use('/api/my-feature', router);
   }
   ```

2. **Register in main routes:**
   ```typescript
   // server/routes.ts
   import { registerMyFeatureRoutes } from './features/my-feature/routes';
   registerMyFeatureRoutes(app);
   ```

3. **Follow consistent patterns:**
   - Use Zod for validation
   - Include proper error handling
   - Add rate limiting where appropriate
   - Implement proper logging

## API Versioning

Currently using URL-based versioning (implicit v1). Future versions will use:
```
/api/v2/feature-name/endpoint
```

## Changelog

### v1.0.0 (Current)
- Feature-driven API architecture
- Authentication with RBAC
- Multi-provider AI integration
- Real-time chat with WebSocket
- Translation and prompt improvement
- Template management
- Comprehensive error handling
