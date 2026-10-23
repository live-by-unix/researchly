import type { ResearchRequest, ResearchResponse, HealthResponse, ErrorResponse } from '@shared/types';

// API base URL - configured for both development and production
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorData: ErrorResponse;
    try {
      errorData = await response.json();
    } catch {
      throw new ApiError(
        `HTTP ${response.status}: ${response.statusText}`,
        'UNKNOWN_ERROR',
        response.status
      );
    }
    throw new ApiError(errorData.error, errorData.code, response.status);
  }

  return response.json();
}

export async function checkHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/v1/health`);
  return handleResponse<HealthResponse>(response);
}

export async function submitResearch(request: ResearchRequest): Promise<ResearchResponse> {
  console.log('Submitting research request:', request);
  console.log('API base URL:', API_BASE_URL);

  const response = await fetch(`${API_BASE_URL}/v1/research`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  console.log('Response status:', response.status);
  const result = await handleResponse<ResearchResponse>(response);
  console.log('Research result:', result);
  return result;
}
