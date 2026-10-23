# Deployment Guide

## Overview

Research.ly deploys to:
- **Frontend**: Cloudflare Pages
- **Backend**: Cloudflare Workers

## Prerequisites

- Cloudflare account
- Wrangler CLI installed and authenticated
- Firecrawl API key
- Groq API key

## Authenticate Wrangler

```bash
wrangler login
```

## Deploy Worker

### 1. Configure Production Secrets

```bash
cd worker
wrangler secret put FIRECRAWL_API_KEY
# Paste your Firecrawl API key when prompted

wrangler secret put GROQ_API_KEY
# Paste your Groq API key when prompted
```

### 2. Deploy

```bash
cd worker
wrangler deploy --config wrangler.toml
```

Note the deployed Worker URL (e.g., `https://researchly-worker.YOUR_SUBDOMAIN.workers.dev`).

### 3. Verify Deployment

```bash
curl https://researchly-worker.YOUR_SUBDOMAIN.workers.dev/api/v1/health
```

## Deploy Frontend to Cloudflare Pages

### Option 1: Direct Wrangler Deployment

```bash
cd frontend
npm run build
wrangler pages deploy dist --project-name researchly
```

### Option 2: GitHub Integration (Recommended)

1. Push code to GitHub
2. In Cloudflare Dashboard:
   - Create a new Pages project
   - Connect to GitHub repository
   - Configure build settings:
     - Build command: `cd frontend && npm install && npm run build`
     - Build output directory: `frontend/dist`
3. Deploy automatically on push

### Configure Production API URL

In Cloudflare Pages dashboard, set environment variable:

```
VITE_API_BASE_URL=/api
```

Or set to the Worker URL if not using Pages Functions for routing.

### Configure Pages Functions (Optional)

To route `/api/*` requests to the Worker:

1. Create `frontend/public/_worker.js` (already included)
2. Set environment variable in Pages:
   ```
   WORKER_URL=https://researchly-worker.YOUR_SUBDOMAIN.workers.dev
   ```

This proxies API requests to the deployed Worker.

## Verify Full Deployment

1. Visit your Pages URL
2. Enter a research topic
3. Submit and verify results display
4. Check browser console for errors

## Update DNS (Optional)

For custom domains:

1. Add custom domain in Cloudflare Pages dashboard
2. Update DNS records as instructed
3. SSL certificate is automatic

## Zero-Downtime Deployments

- Workers: Wrangler handles zero-downtime deployments
- Pages: Each build creates a new deployment; promote to production

## Rollback

### Worker Rollback

```bash
wrangler deployments list --config worker/wrangler.toml
wrangler rollback <deployment-id> --config worker/wrangler.toml
```

### Pages Rollback

In Cloudflare Pages dashboard, select a previous deployment and "Rollback to this deployment".

## Monitoring

### Worker Monitoring

- Cloudflare Dashboard > Workers & Pages
- View metrics: requests, errors, latency
- Real-time logs: `wrangler tail --config worker/wrangler.toml`

### Pages Monitoring

- Cloudflare Dashboard > Pages
- View analytics: bandwidth, requests, visitors
- Build logs in dashboard

## Troubleshooting

### Worker deployment fails

- Check Wrangler authentication: `wrangler whoami`
- Verify secrets are set: `wrangler secret list --config worker/wrangler.toml`
- Check `wrangler.toml` configuration

### Pages deployment fails

- Verify build command runs locally
- Check `package.json` scripts
- Review build logs in dashboard

### API requests fail in production

- Verify Worker is deployed and healthy
- Check CORS configuration
- Verify environment variables set in Pages
- Check Worker logs: `wrangler tail`

### Secrets not working

- Verify secrets are set for production (not just local)
- Check case sensitivity of secret names
- Verify secrets in dashboard: `wrangler secret list`

## CI/CD

### GitHub Actions Example

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build:worker
      - run: npm run build:frontend
      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          command: deploy --config worker/wrangler.toml
```

See [Cloudflare Wrangler Action](https://github.com/cloudflare/wrangler-action) for details.
