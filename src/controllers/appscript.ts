import type { FastifyReply, FastifyRequest } from "fastify";
import { lineClient } from "./line";
import { group } from "../repository/group";

export const appscriptWebhookHandler = async (request: FastifyRequest<{
    Body: {
        title: string;
        range: [row: number, col: number],
        nomor: any,
        from: string;
        content: string;
        isContinuation: boolean;
        link: string;
        channel: string
    }
}>, reply: FastifyReply) => {
    console.log(request.body);
    const { nomor, range: [_, c], from, title, content, link, channel } = request.body;

    const res = group.getFromChannel(channel);
    console.log("will send to:", res);

    const send = await Promise.allSettled(res.map(async (row) => {
        const groupId = row.group_id;
        await lineClient.pushMessage({
            to: groupId,
            messages: [{
                type: 'flex',
                altText: content.substring(0, 400),
                contents: {
                    type: 'bubble',
                    header: {
                        type: 'box',
                        layout: 'vertical',
                        paddingAll: 'lg',
                        contents: [{
                            type: 'text',
                            text: title + ` [${nomor} - ${c}]`,
                            weight: 'bold',
                            align: 'center',
                            size: 'lg',
                            wrap: true,
                        }]
                    },
                    body: {
                        type: 'box',
                        layout: 'vertical',
                        contents: [{
                            type: 'text',
                            text: 'From: ' + from,
                            wrap: true,
                            size: 'xs',
                            color: '#00000070',
                        }, {
                            type: 'separator',
                            margin: 'md',
                            color: '#000000DE',
                        }, {
                            type: 'text',
                            margin: 'md',
                            text: content,
                            wrap: true,
                        }]
                    },
                    footer: {
                        type: 'box',
                        layout: 'vertical',
                        paddingAll: 'lg',
                        contents: [{
                            type: 'button',
                            action: {
                                type: 'uri',
                                label: 'View in spreadsheet',
                                uri: link
                            }
                        }]
                    }
                }
            }],
        });
    }));
    console.log(Object.fromEntries(send.map((result, i) => [res[i].group_id, result])));
    if (send.some((result) => result.status === 'rejected')) {
        reply.code(500).send();
    } else {
        reply.code(200).send();
    }
}