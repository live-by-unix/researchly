/**
 * Cloudflare Pages Functions for API routing
 * This routes /api/* requests to the Research.ly Worker
 */

export async function onRequest(context) {
  const { request, env } = context;

  // In production, this would route to the deployed Worker
  // For development, we proxy to a local Worker or use environment variable
  const workerUrl = env.WORKER_URL || 'https://researchly-worker.YOUR_SUBDOMAIN.workers.dev';

  const url = new URL(request.url);
  const workerRequest = new Request(`${workerUrl}${url.pathname}${url.search}`, {
    method: request.method,
    headers: request.headers,
    body: request.body,
  });

  try {
    const response = await fetch(workerRequest);
    const newResponse = new Response(response.body, response);
    newResponse.headers.set('Access-Control-Allow-Origin', '*');
    return newResponse;
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to proxy to worker', code: 'WORKER_PROXY_ERROR' }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
