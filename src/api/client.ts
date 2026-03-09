import { API_BASE_URL, BEARER_TOKEN, DB_API_BASE_URL } from './config';

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

  if (!response.ok) {
    if (__DEV__) console.log(`[API] ${path} ✗ ${response.status}`);
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const items = Array.isArray(data) ? data : data?.data;
  const sample = Array.isArray(items) && items.length > 0 ? items[0].name || items[0].id || '' : '';
  if (__DEV__) console.log(`[API] ${path} → ${Array.isArray(items) ? items.length : '?'}${sample ? ', e.g. ' + sample : ''}`);
  return data as T;
}

export async function dbApiGet<T>(path: string, params?: URLSearchParams): Promise<T> {
  if (!DB_API_BASE_URL) {
    throw new Error(
      'DB-API base URL is missing. Set EXPO_PUBLIC_DB_API_BASE_URL_PROD for production mode.',
    );
  }
  const base = DB_API_BASE_URL.endsWith('/') ? DB_API_BASE_URL : DB_API_BASE_URL + '/';
  const url = new URL(path.replace(/^\//, ''), base);
  if (params) {
    params.forEach((value, key) => {
      url.searchParams.append(key, value);
    });
  }

  if (__DEV__) console.log(`[DB-API] GET ${url.toString()}`);

  const response = await fetch(url.toString(), {
    headers: {
      'User-Agent': 'omio-reinvented/1.0',
    },
  });

  if (!response.ok) {
    if (__DEV__) console.log(`[DB-API] ${path} ✗ ${response.status}`);
    throw new Error(`DB-API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const items = Array.isArray(data) ? data : data?.data;
  const sample = Array.isArray(items) && items.length > 0 ? items[0].name || items[0].id || '' : '';
  if (__DEV__) console.log(`[DB-API] ${path} → ${Array.isArray(items) ? items.length : '?'}${sample ? ', e.g. ' + sample : ''}`);
  return data as T;
}
