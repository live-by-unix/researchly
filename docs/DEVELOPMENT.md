# Development Guide

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Wrangler CLI: `npm install -g wrangler`

## Project Structure

```
researchly/
├── frontend/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── pages/
│   │   └── tests/
│   ├── public/
│   └── package.json
├── worker/            # Cloudflare Worker
│   ├── src/
│   │   ├── services/
│   │   ├── tests/
│   │   └── index.ts
│   ├── .dev.vars
│   └── package.json
├── shared/            # Shared types
│   └── types.ts
├── docs/              # Documentation
├── package.json       # Root workspace
└── README.md
```

## Setup

### 1. Install Dependencies

```bash
npm install
```

This installs dependencies for all workspaces (frontend, worker).

### 2. Configure API Keys

Create `worker/.dev.vars`:

```bash
FIRECRAWL_API_KEY=your_firecrawl_api_key
GROQ_API_KEY=your_groq_api_key
```

Get keys from:
- Firecrawl: https://www.firecrawl.dev/
- Groq: https://console.groq.com/

### 3. Environment Variables

Frontend uses `.env.development` (already configured):

```bash
VITE_API_BASE_URL=http://localhost:8787/api
```

## Running Locally

### Start the Worker

```bash
npm run dev:worker
```

The Worker runs on `http://localhost:8787`.

### Start the Frontend

In a separate terminal:

```bash
npm run dev:frontend
```

The frontend runs on `http://localhost:3000`.

### Test the API

```bash
curl http://localhost:8787/api/v1/health
```

## Building

### Build Frontend

```bash
npm run build:frontend
```

Output: `frontend/dist/`

### Build Worker

```bash
npm run build:worker
```

Output: `worker/dist/` (TypeScript compilation)

## Testing

### Run All Tests

```bash
npm test
```

### Run Frontend Tests

```bash
npm run test:frontend
```

### Run Worker Tests

```bash
npm run test:worker
```

### Run Worker Tests in Watch Mode

```bash
npm run test:worker -- --watch
```

## Code Style

- TypeScript strict mode enabled
- ESLint configured (add rules as needed)
- Prettier not configured (add if desired)

## Adding Features

### Frontend

1. Add components in `frontend/src/components/`
2. Add pages in `frontend/src/pages/`
3. Add utilities in `frontend/src/lib/`
4. Update types in `shared/types.ts` if needed

### Worker

1. Add services in `worker/src/services/`
2. Update `worker/src/index.ts` for new endpoints
3. Add tests in `worker/src/tests/`
4. Update config in `worker/src/config.ts` if needed

### Shared Types

Add shared TypeScript interfaces in `shared/types.ts` to avoid duplication.

## Debugging

### Worker Debugging

Use Wrangler's built-in logging:

```bash
wrangler dev --config worker/wrangler.toml --log-level debug
```

### Frontend Debugging

Use browser DevTools. Vite provides HMR and source maps.

## Common Issues

### Worker fails to start

- Check `.dev.vars` exists and has valid keys
- Verify Wrangler is authenticated: `wrangler whoami`
- Check port 8787 is not in use

### Frontend can't reach Worker

- Verify Worker is running on localhost:8787
- Check `VITE_API_BASE_URL` in `.env.development`
- Check CORS configuration in Worker

### Tests fail

- Ensure all dependencies are installed
- Check Node.js version >= 18
- Clear node_modules and reinstall if needed

## Contributing

1. Create a feature branch
2. Make changes with tests
3. Run tests: `npm test`
4. Build: `npm run build:frontend && npm run build:worker`
5. Submit PR with description

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.
