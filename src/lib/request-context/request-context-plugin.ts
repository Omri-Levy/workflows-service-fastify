import FastifyPlugin from 'fastify-plugin';

import { startRequestContext } from './request-context';

/**
 * A Fastify plugin to start a request context.
 */
export const RequestContextPlugin = FastifyPlugin(async (app) => {
	app.addHook('onRequest', (request, reply, done) => {
		const context = {
			requestId: request.id as string,
		};

		startRequestContext(context, done);
	});
});
