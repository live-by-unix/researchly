# Provider Configuration

## Firecrawl

### Purpose

Firecrawl provides web search and content extraction capabilities.

### Configuration

- **API Base URL**: `https://api.firecrawl.dev/v1`
- **Environment Variable**: `FIRECRAWL_API_KEY`
- **Service**: `worker/src/services/firecrawl.ts`

### Getting an API Key

1. Visit https://www.firecrawl.dev/
2. Sign up for an account
3. Navigate to API keys section
4. Copy your API key

### Usage

The Firecrawl service is used for:
- Searching for relevant sources
- Extracting page content (markdown format)
- Retrieving metadata (title, description, etc.)

### Key Methods

- `search(options)`: Search for sources by query
- `scrape(options)`: Extract content from a specific URL
- `deduplicateSources(sources)`: Remove duplicate URLs
- `normalizeUrl(url)`: Normalize URLs for comparison

### Limitations

- Rate limits depend on your Firecrawl plan
- Some sites may block scraping
- Content extraction may fail for complex pages

## Groq

### Purpose

Groq provides AI-powered summarization using large language models.

### Configuration

- **API Base URL**: `https://api.groq.com/openai/v1`
- **Environment Variable**: `GROQ_API_KEY`
- **Service**: `worker/src/services/groq.ts`
- **Required Model**: `openai/gpt-oss-20b`

### Getting an API Key

1. Visit https://console.groq.com/
2. Sign up for an account
3. Navigate to API keys section
4. Copy your API key

### Model Configuration

The required model is **`openai/gpt-oss-20b`**.

This is configured centrally in `worker/src/config.ts`:

```typescript
export const GROQ_MODEL_ID = 'openai/gpt-oss-20b';
```

### Verification

A test verifies the model configuration:

```typescript
import { GROQ_MODEL_ID } from '../config';

it('should use the required Groq model: openai/gpt-oss-20b', () => {
  expect(GROQ_MODEL_ID).toBe('openai/gpt-oss-20b');
});
```

### Changing the Model

To change the model intentionally:

1. Edit `worker/src/config.ts`
2. Update `GROQ_MODEL_ID` to the new model ID
3. Update `docs/PROVIDERS.md` to document the change
4. Update the model verification test
5. Run tests to ensure compatibility

**Do not silently change the model.** The model choice is a product decision with implications for:
- Cost
- Performance
- Output quality
- Licensing

### Usage

The Groq service is used for:
- Generating source summaries
- Extracting key points
- Explaining source relevance
- Identifying source limitations

### Key Methods

- `generateSummary(options)`: Generate a single summary
- `generateSummariesBatch(sources, concurrency)`: Generate multiple summaries with bounded concurrency
- `verifyModel()`: Verify configured model matches requirements
- `getConfiguredModel()`: Get the configured model ID (for diagnostics)

### Prompt Engineering

The summary prompt is in `worker/src/config.ts`:

```typescript
export const SUMMARY_PROMPT = `
You are a research assistant. Your task is to summarize a web page's content...
`;
```

The prompt instructs the model to:
- Base summaries ONLY on provided content
- Avoid external knowledge
- Be concise and factual
- Identify insufficient content
- Output valid JSON

### Settings

- **Max Tokens**: 1000
- **Temperature**: 0.3 (low temperature for factual summaries)
- **Response Format**: JSON object

### Limitations

- Rate limits depend on your Groq plan
- Token limits affect summary length
- Content is truncated if too long (15,000 characters)
- Model availability may change

## Security

### API Key Storage

- **Development**: `worker/.dev.vars` (gitignored)
- **Production**: Cloudflare Worker secrets
- **Never**: Frontend code, environment files, Git history

### Setting Production Secrets

```bash
cd worker
wrangler secret put FIRECRAWL_API_KEY
wrangler secret put GROQ_API_KEY
```

### Verifying Secrets

```bash
wrangler secret list --config worker/wrangler.toml
```

### Key Rotation

1. Generate new API key from provider
2. Update local `.dev.vars`
3. Update production secret: `wrangler secret put FIRECRAWL_API_KEY`
4. Redeploy Worker
5. Verify with health check

## Cost Management

### Firecrawl

- Free tier: Limited requests/month
- Check your plan at https://www.firecrawl.dev/pricing
- Implement caching if usage is high

### Groq

- Free tier: Limited tokens/month
- Check your plan at https://console.groq.com/
- Model `openai/gpt-oss-20b` may have specific pricing
- Monitor usage in Groq dashboard

### Cost Controls

- `MAX_SOURCES_LIMIT`: 20 (configurable in `worker/src/config.ts`)
- `DEFAULT_MAX_SOURCES`: 10
- `CONCURRENT_EXTRACTIONS`: 3
- `GROQ_MAX_TOKENS`: 1000

## Troubleshooting

### Firecrawl Errors

**"Firecrawl search failed"**
- Verify API key is valid
- Check quota in Firecrawl dashboard
- Ensure network access to Firecrawl API

**"Failed to scrape page"**
- URL may be blocking scraping
- Content may be behind authentication
- Site may be unavailable

### Groq Errors

**"Groq API failed"**
- Verify API key is valid
- Check quota in Groq dashboard
- Ensure model `openai/gpt-oss-20b` is available

**"Failed to parse Groq response as JSON"**
- Model may have returned invalid JSON
- Check prompt for clear instructions
- Lower temperature if model is being creative

**"AI service misconfigured"**
- Model verification failed
- Check `GROQ_MODEL_ID` in config
- Run model verification test

## Monitoring

### Firecrawl

- Monitor API usage in Firecrawl dashboard
- Check error rates in Worker logs

### Groq

- Monitor token usage in Groq dashboard
- Check error rates in Worker logs
- Track latency in Worker metrics

## Provider Status

As of 2026-10-23:
- **Firecrawl**: Active, supported
- **Groq**: Active, supported
- **Model**: `openai/gpt-oss-20b` (required)

Check provider documentation for any changes to availability or pricing.
