/**
 * Central configuration for Research.ly Worker
 * This file contains all configurable constants and provider settings
 */

// Required Groq model - DO NOT CHANGE without updating docs/PROVIDERS.md
export const GROQ_MODEL_ID = 'openai/gpt-oss-20b';

// Provider configuration
export const GROQ_API_BASE = 'https://api.groq.com/openai/v1';
export const FIRECRAWL_API_BASE = 'https://api.firecrawl.dev/v1';

// Research limits and defaults
export const DEFAULT_MAX_SOURCES = 10;
export const MAX_SOURCES_LIMIT = 20;
export const REQUEST_TIMEOUT_MS = 120000; // 2 minutes
export const CONCURRENT_EXTRACTIONS = 3;

// AI generation settings
export const GROQ_MAX_TOKENS = 1000;
export const GROQ_TEMPERATURE = 0.3;

// Summary prompt template
export const SUMMARY_PROMPT = `
You are a research assistant. Your task is to summarize a web page's content and explain its relevance to a research topic.

Research topic: {topic}

Page content:
{content}

Provide a concise summary and analysis in the following JSON format:
{
  "summary": "A 2-3 sentence summary of the page's main content",
  "keyPoints": ["List of 3-5 key findings or important points from the page"],
  "relevance": "Explain why this source is relevant to the research topic",
  "sourceLimitations": "Any notable limitations, caveats, or gaps in the source (or null if none)"
}

Requirements:
- Base your summary ONLY on the provided page content
- Do not use external knowledge or make unsupported claims
- Be concise and factual
- Identify when the provided content is insufficient to answer
- Output ONLY valid JSON, no additional text
`;

// Health check configuration
export const HEALTH_CHECK_VERSION = '1.0.0';
