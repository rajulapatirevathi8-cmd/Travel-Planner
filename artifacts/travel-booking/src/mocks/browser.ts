// Browser setup for Mock Service Worker
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// Setup worker with our handlers
// Configure to bypass unhandled requests instead of throwing errors
export const worker = setupWorker(...handlers);
