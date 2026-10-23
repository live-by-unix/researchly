# Testing Guide

## Test Strategy

Research.ly uses a multi-layered testing approach:

1. **Unit Tests**: Test individual functions and services
2. **Integration Tests**: Test API endpoints with mocked providers
3. **Model Verification Tests**: Verify Groq model configuration
4. **Frontend Component Tests**: Test React components

## Running Tests

### All Tests

```bash
npm test
```

### Frontend Tests

```bash
npm run test:frontend
```

### Worker Tests

```bash
npm run test:worker
```

### Watch Mode

```bash
npm run test:worker -- --watch
```

## Test Structure

### Worker Tests

Located in `worker/src/tests/`:

- `config.test.ts`: Configuration and model verification
- `groq.test.ts`: Groq service tests (mocked)
- `firecrawl.test.ts`: Firecrawl service tests (mocked)

### Frontend Tests

Located in `frontend/src/tests/`:

- `api.test.ts`: API client tests (mocked)
- `setup.ts`: Test configuration with jest-dom

## Writing Tests

### Worker Service Tests

Example:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GroqService } from '../services/groq';

describe('GroqService', () => {
  let service: GroqService;

  beforeEach(() => {
    service = new GroqService('test-key');
    global.fetch = vi.fn();
  });

  it('should generate summary', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: '{}' } }] }),
    } as any);

    const result = await service.generateSummary({
      topic: 'test',
      content: 'content',
    });

    expect(result).toBeDefined();
  });
});
```

### Frontend Component Tests

Install React Testing Library and jsdom (already in package.json):

```typescript
import { render, screen } from '@testing-library/react';
import LandingPage from '../pages/LandingPage';

it('renders search input', () => {
  render(<LandingPage onResearchComplete={() => {}} />);
  expect(screen.getByPlaceholderText(/enter a research topic/i)).toBeInTheDocument();
});
```

## Model Verification Test

The model verification test ensures the correct Groq model is configured:

```typescript
import { GROQ_MODEL_ID } from '../config';

it('should use the required Groq model: openai/gpt-oss-20b', () => {
  expect(GROQ_MODEL_ID).toBe('openai/gpt-oss-20b');
});
```

This test is in `worker/src/tests/config.test.ts`.

## Integration Tests

Integration tests verify the complete research pipeline:

```typescript
it('should handle complete research request', async () => {
  const request = new Request('http://localhost/api/v1/research', {
    method: 'POST',
    body: JSON.stringify({ topic: 'test' }),
  });

  const response = await handleResearch(request, mockEnv);
  const data = await response.json();

  expect(response.status).toBe(200);
  expect(data.sources).toBeDefined();
});
```

## Mocking Providers

Provider responses are mocked in tests to avoid:
- Real API calls during development
- Rate limits and quotas
- Flaky tests due to external services

Example mock:

```typescript
vi.mocked(fetch).mockResolvedValue({
  ok: true,
  json: async () => ({
    success: true,
    data: [/* mock sources */],
  }),
} as any);
```

## Real Integration Tests

To test with real credentials (use sparingly):

```typescript
it('should call real Firecrawl API', async () => {
  const service = new FirecrawlService(process.env.FIRECRAWL_API_KEY!);
  const results = await service.search({ query: 'test' });
  expect(results.length).toBeGreaterThan(0);
});
```

Run with:
```bash
FIRECRAWL_API_KEY=real_key npm run test:worker
```

## Test Coverage

View coverage:

```bash
npm run test:worker -- --coverage
```

## Common Issues

### Tests fail with "global is not defined"

Ensure vitest config has correct environment:
- Worker: `environment: 'node'`
- Frontend: `environment: 'jsdom'`

### Fetch mocking doesn't work

Ensure `global.fetch = vi.fn()` is in `beforeEach()` and `vi.restoreAllMocks()` in `afterEach()`.

### Type errors in tests

Ensure `@cloudflare/workers-types` is installed for Worker tests.

## CI/CD Integration

Add to GitHub Actions:

```yaml
- run: npm ci
- run: npm test
```

## Best Practices

1. Mock external services (Firecrawl, Groq)
2. Test error paths as well as success paths
3. Keep tests fast (avoid real API calls in unit tests)
4. Use descriptive test names
5. Test configuration constants (like model ID)
6. Verify CORS handling in API tests
7. Test input validation
