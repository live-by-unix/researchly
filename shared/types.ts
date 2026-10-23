/**
 * Shared types and schemas for Research.ly
 * These types are used by both the frontend and Cloudflare Worker
 */

export interface ResearchRequest {
  topic: string;
  maxSources?: number;
}

export interface Source {
  id: string;
  url: string;
  title: string;
  domain: string;
  summary: string;
  keyPoints: string[];
  relevance: string;
  sourceLimitations?: string;
  extractedAt: string;
}

export interface ResearchResponse {
  id: string;
  topic: string;
  sources: Source[];
  totalSources: number;
  completedAt: string;
  status: 'success' | 'partial' | 'error';
  error?: string;
}

export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
}

export interface ErrorResponse {
  error: string;
  code: string;
  timestamp: string;
}

export interface GroqSummary {
  summary: string;
  keyPoints: string[];
  relevance: string;
  sourceLimitations?: string;
}

export interface FirecrawlSource {
  url: string;
  title: string;
  description?: string;
  content?: string;
  metadata?: Record<string, unknown>;
}

export interface ProgressUpdate {
  stage: 'searching' | 'extracting' | 'summarizing' | 'preparing';
  progress: number;
  message: string;
}
