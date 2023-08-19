import FastifyPlugin from 'fastify-plugin';

import { logger } from './logger';

/**
 * A Fastify plugin that adds hooks to log incoming requests, outgoing responses, and request errors.
 */
export const LoggingPlugin = FastifyPlugin(async (app) => {
	app.addHook('onRequest', async (request) => {
		logger.info('Incoming request', {
			request: {
				method: request.method,
				url: request.url,
			},
		});
	});

	app.addHook('onResponse', async (request, reply) => {
		logger.info('Outgoing response', {
			response: {
				statusCode: reply.statusCode,
			},
		});
	});

	app.addHook('onError', async (request, reply, error) => {
		logger.error('Request error', error);
	});
});
