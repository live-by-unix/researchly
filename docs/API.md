# API Reference

## Base URL

- Development: `http://localhost:8787/api`
- Production: `/api` (same-origin) or configured Worker URL

## Authentication

No authentication required. API keys are server-side secrets.

## Endpoints

### GET /api/v1/health

Check service health and configuration.

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2024-10-23T10:00:00Z",
  "version": "1.0.0"
}
```

**Status Codes:**
- `200`: Service is healthy

### POST /api/v1/research

Execute a research request.

**Request Body:**

```json
{
  "topic": "string (required, max 500 chars)",
  "maxSources": "number (optional, default 10, max 20)"
}
```

**Success Response (200):**

```json
{
  "id": "uuid",
  "topic": "string",
  "sources": [
    {
      "id": "uuid",
      "url": "string",
      "title": "string",
      "domain": "string",
      "summary": "string",
      "keyPoints": ["string"],
      "relevance": "string",
      "sourceLimitations": "string | null",
      "extractedAt": "ISO 8601 timestamp"
    }
  ],
  "totalSources": "number",
  "completedAt": "ISO 8601 timestamp",
  "status": "success | partial | error"
}
```

**Error Response (4xx/5xx):**

```json
{
  "error": "string",
  "code": "string",
  "timestamp": "ISO 8601 timestamp"
}
```

**Error Codes:**
- `INVALID_TOPIC`: Topic is missing or invalid
- `TOPIC_TOO_LONG`: Topic exceeds 500 characters
- `INVALID_MAX_SOURCES`: Invalid maxSources value
- `SEARCH_FAILED`: Firecrawl search failed
- `SUMMARIZATION_FAILED`: Groq summarization failed
- `AI_MISCONFIGURED`: AI service misconfigured
- `INTERNAL_ERROR`: Internal server error

**Example Request:**

```bash
curl -X POST http://localhost:8787/api/v1/research \
  -H "Content-Type: application/json" \
  -d '{"topic": "quantum computing", "maxSources": 5}'
```

## CORS

All endpoints support CORS with:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type`

## Rate Limiting

No explicit rate limiting configured. Cloudflare Workers provides inherent DDoS protection.

## Timeouts

- Research requests: 120 seconds
- Individual provider calls: Handled by provider SDKs

## Error Handling

All errors return a consistent JSON format with:
- Human-readable error message
- Machine-readable error code
- Timestamp
- HTTP status code

Clients should handle 4xx errors as user-fixable issues and 5xx errors as transient failures.
