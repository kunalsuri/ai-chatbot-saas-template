# Setup Guide

## Quick Start (3 minutes)

```bash
git clone <repo-url>
cd saas-ai-chatbot
npm install
npm run dev
```

**That's it!** Zero configuration required - works immediately.

## Optional: Add AI Keys

```bash
cp .env.example .env
```

Add any of these (all optional):
```env
GEMINI_API_KEY=your-key-here          # Google AI Studio (40+ models)
OPENAI_API_KEY=sk-your-key-here       # OpenAI
OLLAMA_BASE_URL=http://localhost:11434 # Local Ollama
```

## Troubleshooting

**Port in use?**
```bash
lsof -i :5000
kill -9 <PID>
```

**Dependencies issue?**
```bash
rm -rf node_modules
npm install
```

**Need help?** Open an [issue](https://github.com/kunalsuri/saas-ai-chatbot/issues)
