# Changelog

All notable changes to Research.ly will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release of Research.ly
- Firecrawl integration for web search and content extraction
- Groq integration with `openai/gpt-oss-20b` model for AI summarization
- React frontend with Vite and Tailwind CSS
- Cloudflare Worker backend API
- Source-by-source research engine (not chatbot-style)
- Source deduplication and filtering
- Individual source cards with summaries, key points, and relevance
- Source filtering by domain
- Sorting options (relevance, domain)
- Save research sessions to localStorage
- Export to Markdown and JSON
- Responsive design for desktop, tablet, and mobile
- Health check endpoint
- Comprehensive test suite with mocked provider responses
- Model verification test for `openai/gpt-oss-20b`
- Complete documentation (Architecture, API, Development, Deployment, Testing, Providers)
- BSD 3-Clause license

### Security
- All API keys stored server-side in Cloudflare Worker secrets
- No credentials in frontend code or build artifacts
- Input validation on all API endpoints
- Request size limits and timeouts
- Safe rendering of source content

## [1.0.0] - 2026-10-23

### Added
- Initial production release
