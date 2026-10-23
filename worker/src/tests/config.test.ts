/**
 * Configuration and model verification tests
 */

import { describe, it, expect } from 'vitest';
import { GROQ_MODEL_ID, HEALTH_CHECK_VERSION } from '../config';

describe('Configuration', () => {
  it('should use the required Groq model: openai/gpt-oss-20b', () => {
    expect(GROQ_MODEL_ID).toBe('openai/gpt-oss-20b');
  });

  it('should have a valid health check version', () => {
    expect(HEALTH_CHECK_VERSION).toBeDefined();
    expect(typeof HEALTH_CHECK_VERSION).toBe('string');
  });
});
