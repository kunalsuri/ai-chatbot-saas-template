# Environment Setup

## Zero Config Start

Works immediately without any setup:
```bash
npm run dev
```

## Optional AI Keys

```bash
cp .env.example .env
```

Add any of these (all optional):
```env
# Google AI Studio (40+ models)
GEMINI_API_KEY=your-key-here

# OpenAI
OPENAI_API_KEY=sk-your-key-here

# Local Ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2

# Session secret (auto-generated if missing)
SESSION_SECRET=your-secure-secret
```

## Production Notes

For production deployment:
- Use strong `SESSION_SECRET` (64+ chars)
- Add at least one AI service key
- Set `NODE_ENV=production`

Check `/health` endpoint for system status.
