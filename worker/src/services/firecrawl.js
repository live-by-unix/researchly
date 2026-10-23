/**
 * Firecrawl integration for web search and content extraction
 */
import { FIRECRAWL_API_BASE } from '../config';
export class FirecrawlService {
    apiKey;
    constructor(apiKey) {
        this.apiKey = apiKey;
    }
    /**
     * Search for sources relevant to a topic
     */
    async search(options) {
        const { query, maxResults = 10 } = options;
        const response = await fetch(`${FIRECRAWL_API_BASE}/search`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query,
                limit: maxResults,
            }),
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Firecrawl search failed: ${response.status} - ${errorText}`);
        }
        const data = await response.json();
        // Normalize Firecrawl response to our FirecrawlSource format
        if (data.success && data.data) {
            return data.data.map((item) => ({
                url: item.url || item.metadata?.sourceURL,
                title: item.title || item.metadata?.title || 'Untitled',
                description: item.description || item.metadata?.description,
                content: item.markdown || item.content,
                metadata: item.metadata || {},
            })).filter((source) => {
                // Filter out sources without valid URLs or content
                return source.url && (source.content || source.description);
            });
        }
        return [];
    }
    /**
     * Extract full content from a specific URL
     */
    async scrape(options) {
        const { url } = options;
        const response = await fetch(`${FIRECRAWL_API_BASE}/scrape`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                url,
            }),
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Firecrawl scrape failed: ${response.status} - ${errorText}`);
        }
        const data = await response.json();
        if (data.success && data.data) {
            return {
                url: data.data.metadata?.sourceURL || url,
                title: data.data.metadata?.title || 'Untitled',
                description: data.data.metadata?.description,
                content: data.data.markdown || data.data.content,
                metadata: data.data.metadata,
            };
        }
        throw new Error('Failed to scrape page: Invalid response from Firecrawl');
    }
    /**
     * Normalize a URL for deduplication
     */
    normalizeUrl(url) {
        try {
            const parsed = new URL(url);
            // Remove trailing slash, standardize to lowercase
            const normalized = parsed.href.replace(/\/$/, '').toLowerCase();
            return normalized;
        }
        catch {
            return url.toLowerCase();
        }
    }
    /**
     * Deduplicate sources by normalized URL
     */
    deduplicateSources(sources) {
        const seen = new Set();
        const deduplicated = [];
        for (const source of sources) {
            const normalized = this.normalizeUrl(source.url);
            if (!seen.has(normalized)) {
                seen.add(normalized);
                deduplicated.push(source);
            }
        }
        return deduplicated;
    }
}
