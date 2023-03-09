import { Item, Query } from '@directus/shared/types';
import { z } from 'zod';

export const WebSocketMessage = z
	.object({
		type: z.string(),
		uid: z.string().optional(),
	})
	.passthrough();
export type WebSocketMessage = z.infer<typeof WebSocketMessage> & Record<string, any>; // { type: string; uid?: string } & Record<string, any>;

export const WebSocketResponse = z.union([
	WebSocketMessage.extend({
		status: z.union([z.literal('OK'), z.literal('ok')]),
	}).passthrough(),
	WebSocketMessage.extend({
		status: z.union([z.literal('ERROR'), z.literal('error')]),
		error: z
			.object({
				code: z.string(),
				message: z.string(),
			})
			.passthrough(),
	}).passthrough(),
]);
export type WebSocketResponse = z.infer<typeof WebSocketResponse>;

export const BasicAuthMessage = z.union([
	z.object({ email: z.string(), password: z.string() }),
	z.object({ access_token: z.string() }),
	z.object({ refresh_token: z.string() }),
]);
export type BasicAuthMessage = z.infer<typeof BasicAuthMessage>;

export const WebSocketAuthMessage = WebSocketMessage.extend({
	type: z.union([z.literal('AUTH'), z.literal('auth')]),
}).and(BasicAuthMessage);
export type WebSocketAuthMessage = z.infer<typeof WebSocketAuthMessage>;

export const WebSocketSubscribeMessage = z.union([
	WebSocketMessage.extend({
		type: z.union([z.literal('SUBSCRIBE'), z.literal('subscribe')]),
		collection: z.string(),
		item: z.union([z.string(), z.number()]).optional(),
		query: z.custom<Query>().optional(),
	}),
	WebSocketMessage.extend({
		type: z.union([z.literal('UNSUBSCRIBE'), z.literal('unsubscribe')]),
	}),
]);
export type WebSocketSubscribeMessage = z.infer<typeof WebSocketSubscribeMessage>;

const ZodItem = z.custom<Partial<Item>>();
const PartialItemsMessage = WebSocketMessage.extend({
	type: z.union([z.literal('ITEMS'), z.literal('items')]),
	collection: z.string(),
});

export const WebSocketItemsCreateMessage = PartialItemsMessage.extend({
	action: z.union([z.literal('CREATE'), z.literal('create')]),
	data: z.union([z.array(ZodItem), ZodItem]),
	query: z.custom<Query>().optional(),
});
export const WebSocketItemsReadMessage = PartialItemsMessage.extend({
	action: z.union([z.literal('READ'), z.literal('read')]),
	query: z.custom<Query>(),
});
export const WebSocketItemsUpdateMessage = z.union([
	PartialItemsMessage.extend({
		action: z.union([z.literal('UPDATE'), z.literal('update')]),
		data: ZodItem,
		ids: z.array(z.union([z.string(), z.number()])),
		query: z.custom<Query>().optional(),
	}),
	PartialItemsMessage.extend({
		action: z.union([z.literal('UPDATE'), z.literal('update')]),
		data: ZodItem,
		id: z.union([z.string(), z.number()]),
		query: z.custom<Query>().optional(),
	}),
]);
export const WebSocketItemsDeleteMessage = z.union([
	PartialItemsMessage.extend({
		action: z.union([z.literal('DELETE'), z.literal('delete')]),
		ids: z.array(z.union([z.string(), z.number()])),
	}),
	PartialItemsMessage.extend({
		action: z.union([z.literal('DELETE'), z.literal('delete')]),
		id: z.union([z.string(), z.number()]),
	}),
	PartialItemsMessage.extend({
		action: z.union([z.literal('DELETE'), z.literal('delete')]),
		query: z.custom<Query>(),
	}),
]);
export const WebSocketItemsMessage = z.union([
	WebSocketItemsCreateMessage,
	WebSocketItemsReadMessage,
	WebSocketItemsUpdateMessage,
	WebSocketItemsDeleteMessage,
]);
export type WebSocketItemsMessage = z.infer<typeof WebSocketItemsMessage>;