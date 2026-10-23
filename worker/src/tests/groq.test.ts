/**
 * Groq service tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GroqService } from '../services/groq';
import { GROQ_MODEL_ID } from '../config';

describe('GroqService', () => {
  let service: GroqService;
  const mockApiKey = 'test-api-key';

  beforeEach(() => {
    service = new GroqService(mockApiKey);
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Model verification', () => {
    it('should verify the configured model is openai/gpt-oss-20b', () => {
      expect(service.verifyModel()).toBe(true);
    });

    it('should return the configured model ID', () => {
      expect(service.getConfiguredModel()).toBe('openai/gpt-oss-20b');
    });
  });

  describe('generateSummary', () => {
    it('should call Groq API with the correct model', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  summary: 'Test summary',
                  keyPoints: ['Point 1', 'Point 2'],
                  relevance: 'Test relevance',
                  sourceLimitations: null,
                }),
              },
            },
          ],
        }),
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as any);

      await service.generateSummary({
        topic: 'test topic',
        content: 'test content',
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/chat/completions'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockApiKey}`,
          }),
          body: expect.stringContaining(GROQ_MODEL_ID),
        })
      );
    });

    it('should parse valid JSON response', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  summary: 'Test summary',
                  keyPoints: ['Point 1', 'Point 2'],
                  relevance: 'Test relevance',
                  sourceLimitations: null,
                }),
              },
            },
          ],
        }),
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as any);

      const result = await service.generateSummary({
        topic: 'test topic',
        content: 'test content',
      });

      expect(result.summary).toBe('Test summary');
      expect(result.keyPoints).toEqual(['Point 1', 'Point 2']);
      expect(result.relevance).toBe('Test relevance');
    });

    it('should handle API errors', async () => {
      const mockResponse = {
        ok: false,
        text: async () => 'API Error',
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as any);

      await expect(
        service.generateSummary({
          topic: 'test topic',
          content: 'test content',
        })
      ).rejects.toThrow('Groq API failed');
    });

    it('should handle invalid JSON response', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: 'invalid json',
              },
            },
          ],
        }),
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as any);

      await expect(
        service.generateSummary({
          topic: 'test topic',
          content: 'test content',
        })
      ).rejects.toThrow('Failed to parse Groq response as JSON');
    });
  });
});
