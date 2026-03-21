import type { DistanceMode } from '@/shared/types';

const QA_BASE_URL = 'https://api.qa.goeuro.ninja/v2';
const PROD_BASE_URL = 'https://api.omio.com/v2';
const QA_DB_API_BASE_URL = 'https://k8s-qa-1.goeuro.ninja/db-api';
const PROD_DB_API_BASE_URL = 'https://app.prod.goeuro.ninja/db-api';

export const USE_PROD = false;

export const API_BASE_URL = USE_PROD ? PROD_BASE_URL : QA_BASE_URL;
export const PROD_API_BASE_URL = PROD_BASE_URL;

export const BEARER_TOKEN = process.env.EXPO_PUBLIC_OMIO_BEARER ?? '';

export const DEFAULT_LOCALE = 'cs';
export const DEFAULT_CURRENCY = 'EUR';

export const TRAVEL_MODES: Record<DistanceMode, string> = {
  short: 'bus,train',
  medium: 'train',
  long: 'train,flight',
  'extra-long': 'flight',
};

export const MAX_POSITIONS = 15;

export const DB_API_BASE_URL = PROD_DB_API_BASE_URL;
