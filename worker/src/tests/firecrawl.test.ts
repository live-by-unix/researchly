/**
 * Firecrawl service tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FirecrawlService } from '../services/firecrawl';

describe('FirecrawlService', () => {
  let service: FirecrawlService;
  const mockApiKey = 'test-api-key';

  beforeEach(() => {
    service = new FirecrawlService(mockApiKey);
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('normalizeUrl', () => {
    it('should normalize URLs by removing trailing slash', () => {
      expect(service.normalizeUrl('https://example.com/')).toBe('https://example.com');
    });

    it('should convert to lowercase', () => {
      expect(service.normalizeUrl('https://EXAMPLE.COM')).toBe('https://example.com');
    });

    it('should handle malformed URLs gracefully', () => {
      expect(service.normalizeUrl('not-a-url')).toBe('not-a-url');
    });
  });

  describe('deduplicateSources', () => {
    it('should remove duplicate URLs', () => {
      const sources = [
        { url: 'https://example.com/page', title: 'Page 1' },
        { url: 'https://example.com/page/', title: 'Page 2' },
        { url: 'https://example.com/other', title: 'Page 3' },
      ];

      const deduplicated = service.deduplicateSources(sources as any);
      expect(deduplicated).toHaveLength(2);
    });

    it('should preserve order of first occurrence', () => {
      const sources = [
        { url: 'https://example.com/page', title: 'First' },
        { url: 'https://example.com/page/', title: 'Second' },
      ];

      const deduplicated = service.deduplicateSources(sources as any);
      expect(deduplicated[0].title).toBe('First');
    });
  });

  describe('search', () => {
    it('should call Firecrawl search API', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          success: true,
          data: [
            {
              url: 'https://example.com',
              title: 'Example',
              markdown: {
                markdown: 'Content',
                metadata: { title: 'Example' },
              },
            },
          ],
        }),
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as any);

      const result = await service.search({ query: 'test', maxResults: 5 });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/search'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockApiKey}`,
          }),
        })
      );

      expect(result).toHaveLength(1);
      expect(result[0].url).toBe('https://example.com');
    });

    it('should filter sources without valid URLs or content', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          success: true,
          data: [
            {
              url: 'https://example.com',
              title: 'Valid',
              markdown: { markdown: 'Content' },
            },
            {
              url: '',
              title: 'Invalid URL',
              markdown: { markdown: 'Content' },
            },
            {
              url: 'https://example.com/no-content',
              title: 'No Content',
              markdown: {},
            },
          ],
        }),
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as any);

      const result = await service.search({ query: 'test' });
      expect(result).toHaveLength(1);
    });
  });
});
