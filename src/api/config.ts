import type { DistanceMode } from '@/shared/types';

const QA_BASE_URL = 'https://api.omio.com.qa.goeuro.ninja/v2';
const PROD_BASE_URL = 'https://api.goeuro.ninja/v2';

const USE_PROD = false;

export const API_BASE_URL = USE_PROD ? PROD_BASE_URL : QA_BASE_URL;

export const BEARER_TOKEN = process.env.EXPO_PUBLIC_OMIO_BEARER ?? '';

export const FROM_POSITION_ID = '16842359'; // Praha hlavní nádraží

export const DEFAULT_LOCALE = 'cs';
export const DEFAULT_CURRENCY = 'EUR';

export const TRAVEL_MODES: Record<DistanceMode, string> = {
  short: 'bus,train',
  medium: 'train',
  long: 'train,flight',
  'extra-long': 'flight',
};

export const MAX_POSITIONS = 15;
