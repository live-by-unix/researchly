/**
 * Research.ly Cloudflare Worker
 * Main entry point for the research API
 */
import { FirecrawlService } from './services/firecrawl';
import { GroqService } from './services/groq';
import { DEFAULT_MAX_SOURCES, MAX_SOURCES_LIMIT, CONCURRENT_EXTRACTIONS, HEALTH_CHECK_VERSION, } from './config';
/**
 * Create a standardized error response
 */
function createErrorResponse(message, code, status = 400) {
    const error = {
        error: message,
        code,
        timestamp: new Date().toISOString(),
    };
    return new Response(JSON.stringify(error), {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}
/**
 * Handle CORS preflight requests
 */
function handleCORS() {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}
/**
 * GET /api/v1/health - Health check endpoint
 */
async function handleHealth() {
    const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: HEALTH_CHECK_VERSION,
    };
    return new Response(JSON.stringify(health), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        },
    });
}
/**
 * POST /api/v1/research - Main research endpoint
 */
async function handleResearch(request, env) {
    try {
        // Parse and validate request
        const body = await request.json();
        if (!body.topic || typeof body.topic !== 'string' || body.topic.trim().length === 0) {
            return createErrorResponse('Topic is required', 'INVALID_TOPIC', 400);
        }
        if (body.topic.length > 500) {
            return createErrorResponse('Topic is too long (max 500 characters)', 'TOPIC_TOO_LONG', 400);
        }
        const maxSources = Math.min(body.maxSources || DEFAULT_MAX_SOURCES, MAX_SOURCES_LIMIT);
        if (maxSources < 1) {
            return createErrorResponse('maxSources must be at least 1', 'INVALID_MAX_SOURCES', 400);
        }
        // Initialize services
        const firecrawl = new FirecrawlService(env.FIRECRAWL_API_KEY);
        const groq = new GroqService(env.GROQ_API_KEY);
        // Verify Groq model configuration
        if (!groq.verifyModel()) {
            console.error('Groq model verification failed:', groq.getConfiguredModel());
            return createErrorResponse('AI service misconfigured', 'AI_MISCONFIGURED', 500);
        }
        // Step 1: Search for sources
        let firecrawlSources = [];
        try {
            firecrawlSources = await firecrawl.search({
                query: body.topic,
                maxResults: maxSources,
            });
        }
        catch (error) {
            console.error('Firecrawl search error:', error);
            return createErrorResponse('Failed to search for sources', 'SEARCH_FAILED', 502);
        }
        // Deduplicate sources
        firecrawlSources = firecrawl.deduplicateSources(firecrawlSources);
        if (firecrawlSources.length === 0) {
            const emptyResponse = {
                id: crypto.randomUUID(),
                topic: body.topic,
                sources: [],
                totalSources: 0,
                completedAt: new Date().toISOString(),
                status: 'success',
            };
            return new Response(JSON.stringify(emptyResponse), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            });
        }
        // Step 2: Generate summaries using Groq
        const sourcesForAI = firecrawlSources.map((source) => ({
            topic: body.topic,
            content: source.content || source.description || '',
        }));
        let summaries;
        try {
            summaries = await groq.generateSummariesBatch(sourcesForAI, CONCURRENT_EXTRACTIONS);
        }
        catch (error) {
            console.error('Groq summarization error:', error);
            return createErrorResponse('Failed to generate summaries', 'SUMMARIZATION_FAILED', 502);
        }
        // Step 3: Build final response
        const sources = firecrawlSources.map((firecrawlSource, index) => {
            const summary = summaries[index];
            const url = new URL(firecrawlSource.url);
            return {
                id: crypto.randomUUID(),
                url: firecrawlSource.url,
                title: firecrawlSource.title,
                domain: url.hostname,
                summary: summary.summary,
                keyPoints: summary.keyPoints,
                relevance: summary.relevance,
                sourceLimitations: summary.sourceLimitations,
                extractedAt: new Date().toISOString(),
            };
        });
        const response = {
            id: crypto.randomUUID(),
            topic: body.topic,
            sources,
            totalSources: sources.length,
            completedAt: new Date().toISOString(),
            status: 'success',
        };
        return new Response(JSON.stringify(response), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    }
    catch (error) {
        console.error('Research request error:', error);
        return createErrorResponse('Internal server error', 'INTERNAL_ERROR', 500);
    }
}
/**
 * Main request handler
 */
export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return handleCORS();
        }
        // Route handling
        if (url.pathname === '/api/v1/health' && request.method === 'GET') {
            return handleHealth();
        }
        if (url.pathname === '/api/v1/research' && request.method === 'POST') {
            return handleResearch(request, env);
        }
        // 404 for unknown routes
        return createErrorResponse('Not found', 'NOT_FOUND', 404);
    },
};
