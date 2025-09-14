<div align="center">
  <h1>🤖 AI ChatBot SaaS</h1>
  <p>A modern, full-stack SaaS AI chatbot platform with Feature-Driven Development architecture. Supports local LLMs (Ollama, LM Studio) and cloud providers (Google AI, OpenAI et al.) with real-time chat, chat memory, advanced UI, and production-ready authentication.</p>
  
  [![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](./LICENSE)
  [![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
  [![TypeScript](https://img.shields.io/badge/typescript-5.0%2B-blue)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/react-18.3.1-61dafb)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/vite-5.0.0-646CFF)](https://vitejs.dev/)

  [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fkunalsuri%2Fai-chatbot-saas-template)
</div>

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](./LICENSE) file for details.

## ✨ Key Features

- **🏗️ Feature-Driven Development**: Modular architecture with self-contained features
- **🤖 Multi-LLM Support**: Local (Ollama, LM Studio) + Cloud (Google AI, OpenAI et al.)
- **💬 Real-time Chat**: Streaming responses with conversation history
- **🌐 Translation & Summarization**: Built-in AI-powered tools
- **🔒 Enterprise Security**: RBAC, CSRF protection, session management
- **📱 Modern UI/UX**: React 18, TypeScript, Tailwind CSS, Framer Motion
- **🚀 Production Ready**: PWA support, performance monitoring, error boundaries

## 🚀 Quick Start (3 minutes)

### Prerequisites
- Node.js 18+ and npm 9+
- Optional: Local LLM ([LM Studio](https://lmstudio.ai) or [Ollama](https://ollama.com))

### Get Started

```bash
# 1. Clone and install
git clone https://github.com/kunalsuri/ai-chatbot-saas-template.git
cd ai-chatbot-saas-template
npm install

# 2. Start development server
npm run dev

# 3. Open http://localhost:5000
```

**That's it!** The app works immediately with no configuration required.

### 🧪 Run Comprehensive Tests

```bash
# Run all tests, quality checks, and build verification
npm run test:all
```

This single command runs:
- ✅ All unit tests (9 passing tests)
- ✅ TypeScript type checking
- ✅ Code quality analysis
- ✅ Security audit
- ✅ Production build test
- ✅ Coverage report generation

### Optional: Add AI Providers

**For Local LLMs (No API keys needed):**
- Install [LM Studio](https://lmstudio.ai) or [Ollama](https://ollama.com)
- Download a model (e.g., Llama 3.1)
- Start the local server
- Select the provider in the app

**For Cloud Providers:**
- Copy `.env.example` to `.env`
- Add your API keys (Google AI, OpenAI, etc.)
- Restart the server

## 🏗️ Feature-Driven Architecture

Each feature is **self-contained** with its own components, services, types, and routes following modern React and TypeScript best practices:

```
📁 Features (Client & Server)
├── 🔐 auth/              # Authentication & RBAC with session management
├── 💬 chatbot/           # AI Chat with streaming responses
├── 📊 dashboard/         # Analytics with real-time updates
├── 🤖 model-management/  # AI provider management & health monitoring
├── 🌐 translation/       # Translation services with history
├── ✨ prompt-improver/   # AI-powered prompt enhancement
├── 📝 editor/            # Content editing with auto-save
└── ⚙️ settings/          # User preferences & configuration

📁 Modern Infrastructure
├── 🎨 components/ui/     # Accessible Radix UI components
├── 🔧 lib/              # Type-safe utilities & API client
├── 📋 types/            # Strict TypeScript definitions
├── 🔒 security/         # CSRF, rate limiting, validation
└── 📚 docs/             # Comprehensive documentation
```

**Modern Development Benefits:**
- ✅ **React 18+**: Concurrent features, Suspense, automatic batching
- ✅ **TypeScript Strict**: Full type safety with branded types
- ✅ **Performance**: Code splitting, memoization, optimized queries
- ✅ **Accessibility**: WCAG 2.1 AA compliance with Radix UI
- ✅ **Security**: CSRF protection, input validation, secure headers
- ✅ **Developer Experience**: Hot reload, type-safe APIs, structured logging

## 📚 Documentation

- [📖 Setup Guide](./docs/SETUP.md) - Quick start guide and setup instructions
- [🏗️ Architecture](./docs/ARCHITECTURE.md) - Modern system architecture and design patterns
- [⚡ Best Practices](./docs/BEST_PRACTICES.md) - React 18+, TypeScript, and AI development best practices
- [🧪 Testing Guide](./docs/TESTING_GUIDE.md) - Comprehensive testing setup and best practices
- [📝 TypeScript Management](./docs/TYPESCRIPT_MANAGEMENT.md) - Managing TypeScript errors in large codebases
- [🔧 Contributing](./docs/CONTRIBUTING.md) - Contribution guidelines and development workflow
- [🌐 API Reference](./docs/API.md) - Complete API documentation
- [🚀 Deployment Guide](./docs/DEPLOYMENT.md) - Production deployment instructions
- [🔒 Security Guide](./docs/SECURITY.md) - Security guidelines and best practices

## 💾 Simple Storage

**No database setup required!** Everything is stored in local JSON files:

```
data/
├── chat_history.json      # Your conversations
├── users.json            # User accounts
├── templates.json        # Saved templates
└── translation_history.json # Translation history
```

**Benefits:**
- ✅ Zero configuration
- ✅ Easy to backup/restore
- ✅ Perfect for development and small deployments
- ✅ Optional PostgreSQL support for scaling

## 🧠 Adding AI Models (Optional)

### 🏠 Local Models (Free, Private)

**LM Studio** (Recommended for beginners)
```bash
# 1. Download from https://lmstudio.ai
# 2. Download a model (e.g., Llama 3.1 8B)
# 3. Start local server
# 4. Select "LM Studio" in the app
```

**Ollama** (Command-line friendly)
```bash
# 1. Install from https://ollama.com
ollama serve
ollama pull llama3.1
# 2. Select "Ollama" in the app
```

### ☁️ Cloud Models (API Keys Required)

Add to `.env` file:
```bash
GOOGLE_AI_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
```

## 🚀 Production Deployment

### Quick Deploy
```bash
# Build and start
npm run build
npm run dev
```

### Docker (Recommended)
```bash
docker-compose up -d
```

### Platform Deploy
- **Vercel**: Click the deploy button above
- **Railway**: Connect your GitHub repo
- **DigitalOcean**: Use App Platform

See [Deployment Guide](./docs/DEPLOYMENT.md) for detailed instructions.

## 🤝 Contributing

**Adding a new feature is easy with FDD:**

```bash
# 1. Create feature directories
mkdir -p server/features/my-feature/{routes,services,types}
mkdir -p client/src/features/my-feature/{components,hooks,api}

# 2. Implement your feature
# 3. Register routes in server/routes.ts
# 4. Add navigation in client sidebar
# 5. Submit PR
```

See [Development Guide](./docs/DEVELOPMENT.md) for detailed contribution guidelines.

## 🔗 Links

- [Report Bug](https://github.com/kunalsuri/saas-ai-chatbot/issues)
- [Request Feature](https://github.com/kunalsuri/saas-ai-chatbot/issues/new?template=feature_request.md)
- [Changelog](./CHANGELOG.md)

---

<div align="center">
  Made with ❤️ in Paris, France | 2025 | Kunal Suri 
</div>
