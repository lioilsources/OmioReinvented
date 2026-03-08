import { API_BASE_URL, BEARER_TOKEN } from './config';

export async function apiGet<T>(path: string, params?: Record<string, string>): Promise<T> {
  const base = API_BASE_URL.endsWith('/') ? API_BASE_URL : API_BASE_URL + '/';
  const url = new URL(path.replace(/^\//, ''), base);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
    });
  }

  if (__DEV__) console.log(`[API] GET ${url.toString()}`);

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${BEARER_TOKEN}`,
      'User-Agent': 'omio-reinvented/1.0',
    },
  });

  if (__DEV__) console.log(`[API] ${response.status} ${path}`);

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}
