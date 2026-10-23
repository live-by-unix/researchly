/**
 * API client tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ApiError, checkHealth, submitResearch } from '../lib/api';

const mockFetch = vi.fn();

describe('API client', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    (global as any).fetch = mockFetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('checkHealth', () => {
    it('should return health status on success', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          status: 'healthy',
          timestamp: '2024-01-01T00:00:00Z',
          version: '1.0.0',
        }),
      };

      mockFetch.mockResolvedValue(mockResponse as any);

      const result = await checkHealth();

      expect(result.status).toBe('healthy');
      expect(result.version).toBe('1.0.0');
    });

    it('should throw ApiError on failure', async () => {
      const mockResponse = {
        ok: false,
        json: async () => ({
          error: 'Service unavailable',
          code: 'SERVICE_UNAVAILABLE',
          timestamp: '2024-01-01T00:00:00Z',
        }),
      };

      mockFetch.mockResolvedValue(mockResponse as any);

      await expect(checkHealth()).rejects.toThrow(ApiError);
    });
  });

  describe('submitResearch', () => {
    it('should send research request', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          id: 'test-id',
          topic: 'test topic',
          sources: [],
          totalSources: 0,
          completedAt: '2024-01-01T00:00:00Z',
          status: 'success',
        }),
      };

      mockFetch.mockResolvedValue(mockResponse as any);

      const result = await submitResearch({ topic: 'test topic' });

      expect(result.id).toBe('test-id');
      expect(result.topic).toBe('test topic');
    });

    it('should throw ApiError on invalid request', async () => {
      const mockResponse = {
        ok: false,
        json: async () => ({
          error: 'Invalid topic',
          code: 'INVALID_TOPIC',
          timestamp: '2024-01-01T00:00:00Z',
        }),
      };

      mockFetch.mockResolvedValue(mockResponse as any);

      await expect(submitResearch({ topic: '' })).rejects.toThrow(ApiError);
    });
  });
});
