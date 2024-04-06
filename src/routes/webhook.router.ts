import type { FastifyInstance } from 'fastify';
import { lineWebhookHandler } from '../controllers/line';
import { appscriptWebhookHandler } from '../controllers/appscript';

export default async function WebhookRoutes(app: FastifyInstance) {
  app.post('/line', { helmet: false, schema: {} }, lineWebhookHandler);
  app.post('/appscript', { helmet: false, schema: {} }, appscriptWebhookHandler);
}
