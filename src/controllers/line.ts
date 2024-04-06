import { middleware, type WebhookEvent } from '@line/bot-sdk';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { db } from '../database';
import { messagingApi } from '@line/bot-sdk';

const lineClientConfig = {
    channelAccessToken: Bun.env.CHANNEL_ACCESS_TOKEN as string,
    channelSecret: Bun.env.CHANNEL_SECRET as string,
};
export const lineClient = new messagingApi.MessagingApiClient(lineClientConfig);
export const lineMiddleware = middleware(lineClientConfig);

export const lineWebhookHandler = async (request: FastifyRequest<{
  Body: {
    events: WebhookEvent[];
  }
}>, reply: FastifyReply) => {
  const events: WebhookEvent[] = request.body.events;
  
  for (const event of events) {
    if (event.type === 'join' && event.source.type === 'group') {
      console.log(event);
      const groupId = event.source.groupId;
      const stmt = db.query('INSERT OR IGNORE INTO lineGroups (group_id) VALUES ($groupId)');
      stmt.run({ $groupId: groupId });
      lineClient.replyMessage({
        replyToken: event.replyToken,
        messages: [{
          type: 'text',
          text: 'Informasi asistensi dan QnA akan dibroadcast di sini.'
        }]
      });
    } else if (event.type === 'leave' && event.source.type === 'group') {
      console.log(event);
      const groupId = event.source.groupId;
      const stmt = db.query('DELETE FROM lineGroups WHERE group_id = $groupId');
      stmt.run({ $groupId: groupId });
    }
  }

  reply.code(200).send();
}