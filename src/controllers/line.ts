import { middleware, type WebhookEvent } from '@line/bot-sdk';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { messagingApi } from '@line/bot-sdk';
import { defaultMessages, specialMessages } from './messages';
import { group } from '../repository/group';

const lineClientConfig = {
    channelAccessToken: Bun.env.CHANNEL_ACCESS_TOKEN as string,
    channelSecret: Bun.env.CHANNEL_SECRET as string,
};
export const lineClient = new messagingApi.MessagingApiClient(lineClientConfig);
export const lineMiddleware = middleware(lineClientConfig);

const text = {
  reply: (replyToken: string, message: string) => {
    lineClient.replyMessage({
        replyToken,
        messages: [{ type: 'text', text: message.trim() }]
    });
  },
}

export const lineWebhookHandler = async (request: FastifyRequest<{
  Body: {
    events: WebhookEvent[];
  }
}>, reply: FastifyReply) => {
  const events: WebhookEvent[] = request.body.events;
  
  for (const event of events) {
    if (event.type === 'join' && event.source.type === 'group') {
      text.reply(event.replyToken, specialMessages.join);
    } else if (event.type === 'message' && event.source.type === 'group' && event.message.type === 'text' && event.message.text.startsWith('as!')) {
      const splitCmd = event.message.text.replaceAll(/\s+/g, ' ').split(' ');
      const [_, cmd, ...args] = splitCmd;
      if (splitCmd.length < 2) {
        text.reply(event.replyToken, specialMessages.unknown);
        return;
      };
      console.log(splitCmd);
      const groupId = event.source.groupId;
      switch (cmd) {
        case 'reg':
        case 'unreg':
          const action = { reg: group.addChannel.bind(group), unreg: group.removeChannel.bind(group) };
          if (splitCmd.length !== 3) {
            text.reply(event.replyToken, specialMessages[cmd].Usage);
            break;
          }
          const channel = args[0];
          const isSuccess = await action[cmd](groupId, channel);
          if (isSuccess) {
            text.reply(event.replyToken, specialMessages[cmd].Success(channel));
          } else {
            text.reply(event.replyToken, specialMessages[cmd].Failed(channel));
          }
          break;
        case 'list':
          text.reply(
            event.replyToken, specialMessages.list(
              group.getChannels(groupId).map(c => c.channel)
            )
          );
          break;
        default:
          text.reply(event.replyToken,
            defaultMessages[splitCmd[1]] || specialMessages.unknown
          );
      }
    } else if (event.type === 'leave' && event.source.type === 'group') {
      group.delete(event.source.groupId);
    }
  }

  reply.code(200).send();
}