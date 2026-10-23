# Research.ly

A source-by-source research engine that discovers, extracts, and summarizes relevant online sources using AI.

## Overview

Research.ly helps users research a topic by:

1. Searching the web through Firecrawl
2. Discovering relevant source pages
3. Extracting page content and metadata
4. Removing duplicate sources and filtering irrelevant results
5. Using Groq's `openai/gpt-oss-20b` model to produce concise, source-grounded summaries
6. Explaining why each source is relevant to the research topic
7. Displaying findings in a clear, attractive, navigable interface

**This is a source-by-source research engine, not a chatbot that writes one essay and invents references.** Each result corresponds to an actual source discovered through Firecrawl.

## Architecture

Research.ly consists of two separately deployable Cloudflare applications:

- **Frontend**: React + Vite + Tailwind CSS, deployed to Cloudflare Pages
- **Backend**: TypeScript Cloudflare Worker API, deployed to Cloudflare Workers

The Worker handles all provider integrations (Firecrawl, Groq) and keeps API keys server-side.

## Features

- Real web search and content extraction via Firecrawl
- AI-powered summaries using Groq's `openai/gpt-oss-20b` model
- Source deduplication and filtering
- Individual source cards with summaries, key points, and relevance explanations
- Source filtering by domain
- Sorting options
- Save research sessions locally
- Export to Markdown and JSON
- Responsive design for desktop, tablet, and mobile
- Accessible keyboard navigation

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Wrangler CLI (`npm install -g wrangler`)
- Firecrawl API key
- Groq API key

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/live-by-unix/researchly.git
cd researchly
npm install
```

### 2. Configure API Keys

Create `worker/.dev.vars`:

```bash
FIRECRAWL_API_KEY=your_firecrawl_api_key
GROQ_API_KEY=your_groq_api_key
```

See `.dev.vars.example` for the template.

### 3. Run Development

Start the Worker:

```bash
npm run dev:worker
```

Start the Frontend (in another terminal):

```bash
npm run dev:frontend
```

The frontend will be available at `http://localhost:3000`.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [API Reference](docs/API.md)
- [Development Guide](docs/DEVELOPMENT.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Testing Guide](docs/TESTING.md)
- [Provider Configuration](docs/PROVIDERS.md)

## License

BSD 3-Clause License - see [LICENSE](LICENSE) for details.

Copyright (c) 2026, live-by-unix
