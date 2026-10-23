# Architecture

## System Overview

Research.ly is a two-tier application:

1. **Frontend** (Cloudflare Pages): React SPA for user interface
2. **Backend** (Cloudflare Worker): API for research processing

## Data Flow

```
User Request
    ↓
Frontend (React)
    ↓
POST /api/v1/research
    ↓
Cloudflare Worker
    ↓
Firecrawl (Search & Extract)
    ↓
Groq (Summarization)
    ↓
Worker (Process & Filter)
    ↓
Frontend (Display Results)
```

## Frontend Architecture

### Technology Stack
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Lucide React (icons)

### Key Components
- `App.tsx`: Main application with routing
- `LandingPage.tsx`: Search interface
- `ResultsPage.tsx`: Results display with filtering and export
- `api.ts`: API client with error handling

### State Management
- React hooks (useState, useEffect)
- localStorage for saved research sessions
- URL-based routing for navigation

## Backend Architecture

### Technology Stack
- TypeScript
- Cloudflare Workers
- Cloudflare Workers Types

### Service Layer
- `FirecrawlService`: Web search and content extraction
- `GroqService`: AI-powered summarization
- `config.ts`: Centralized configuration

### API Endpoints
- `GET /api/v1/health`: Health check
- `POST /api/v1/research`: Execute research pipeline

### Research Pipeline

1. **Validation**: Validate request parameters
2. **Search**: Query Firecrawl for relevant sources
3. **Deduplication**: Remove duplicate URLs
4. **Extraction**: Extract content from sources
5. **Summarization**: Generate AI summaries using Groq
6. **Response**: Return structured results

## Security Model

- All API keys stored server-side (Worker secrets)
- No credentials in frontend code or build artifacts
- CORS configuration for API access
- Input validation and sanitization
- Request timeouts and rate limiting

## Deployment Architecture

### Development
- Frontend: Vite dev server (localhost:3000)
- Worker: Wrangler dev (localhost:8787)
- API communication via environment variable

### Production
- Frontend: Cloudflare Pages (custom domain)
- Worker: Cloudflare Workers (custom domain)
- API routing via Pages Functions or direct Worker URL

## Data Models

See `shared/types.ts` for shared TypeScript interfaces:
- `ResearchRequest`: Input parameters
- `ResearchResponse`: Output results
- `Source`: Individual source with summary
- `HealthResponse`: Service health status
- `ErrorResponse`: Error information
