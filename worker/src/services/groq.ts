/**
 * Groq integration for AI-powered summarization
 * Uses the required model: openai/gpt-oss-20b
 */

import { GROQ_API_BASE, GROQ_MODEL_ID, GROQ_MAX_TOKENS, GROQ_TEMPERATURE, SUMMARY_PROMPT } from '../config';
import type { GroqSummary } from '@shared/types';

export interface GroqGenerateOptions {
  topic: string;
  content: string;
}

export class GroqService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Verify the configured model ID matches the required model
   */
  verifyModel(): boolean {
    return GROQ_MODEL_ID === 'openai/gpt-oss-20b';
  }

  /**
   * Get the configured model ID (for logging/diagnostics without exposing API key)
   */
  getConfiguredModel(): string {
    return GROQ_MODEL_ID;
  }

  /**
   * Generate a summary for a source using Groq
   */
  async generateSummary(options: GroqGenerateOptions): Promise<GroqSummary> {
    const { topic, content } = options;

    // Truncate content if too long to avoid token limits
    const truncatedContent = content.length > 15000
      ? content.substring(0, 15000) + '... [content truncated]'
      : content;

    const prompt = SUMMARY_PROMPT
      .replace('{topic}', topic)
      .replace('{content}', truncatedContent);

    const response = await fetch(`${GROQ_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL_ID,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: GROQ_MAX_TOKENS,
        temperature: GROQ_TEMPERATURE,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json() as any;

    if (!data.choices || data.choices.length === 0) {
      throw new Error('Groq API returned no choices');
    }

    const contentText = data.choices[0].message?.content;
    if (!contentText) {
      throw new Error('Groq API returned empty content');
    }

    try {
      const summary = JSON.parse(contentText) as GroqSummary;

      // Validate the response structure
      if (!summary.summary || !Array.isArray(summary.keyPoints) || !summary.relevance) {
        throw new Error('Invalid Groq response structure');
      }

      return summary;
    } catch (parseError) {
      throw new Error(`Failed to parse Groq response as JSON: ${parseError}`);
    }
  }

  /**
   * Generate summaries for multiple sources with bounded concurrency
   */
  async generateSummariesBatch(
    sources: Array<{ topic: string; content: string }>,
    concurrency: number = 3
  ): Promise<GroqSummary[]> {
    const results: GroqSummary[] = [];
    const errors: Array<{ index: number; error: Error }> = [];

    // Process in batches
    for (let i = 0; i < sources.length; i += concurrency) {
      const batch = sources.slice(i, i + concurrency);
      const batchPromises = batch.map(async (source, batchIndex) => {
        try {
          const summary = await this.generateSummary(source);
          return { index: i + batchIndex, summary, error: null };
        } catch (error) {
          return { index: i + batchIndex, summary: null, error: error as Error };
        }
      });

      const batchResults = await Promise.all(batchPromises);

      for (const result of batchResults) {
        if (result.error) {
          errors.push({ index: result.index, error: result.error });
        } else if (result.summary) {
          results[result.index] = result.summary;
        }
      }
    }

    // Fill in nulls for failed summaries
    for (let i = 0; i < sources.length; i++) {
      if (!results[i]) {
        results[i] = {
          summary: 'Failed to generate summary due to an error.',
          keyPoints: [],
          relevance: 'Could not determine relevance due to summarization error.',
          sourceLimitations: 'Summarization failed',
        };
      }
    }

    return results;
  }
}
