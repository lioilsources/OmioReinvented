import { setupServer } from 'msw/native';
import { destinationHandlers } from './handlers/destinations';
import { journeyHandlers } from './handlers/journeys';

export const server = setupServer(...destinationHandlers, ...journeyHandlers);
