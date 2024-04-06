import type { FastifyInstance } from "fastify";
import { lineMiddleware } from "./controllers/line";
import WebhookRoutes from "./routes/webhook.router";
import middie from "@fastify/middie";

export async function installRouter(app: FastifyInstance) {    
    await app.register(middie);
    app.use('/webhook/line', lineMiddleware);

    app.register(WebhookRoutes, { prefix: '/webhook' });  
}