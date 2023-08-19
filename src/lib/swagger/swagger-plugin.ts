import FastifySwagger from '@fastify/swagger';
import FastifySwaggerUi from '@fastify/swagger-ui';
import FastifyPlugin from 'fastify-plugin';

import { swaggerOptions } from './swagger-options';

export const SWAGGER_UI_PREFIX = '/docs';

/**
 * A Fastify plugin that adds Swagger and Swagger UI to the Fastify application.
 */
export const SwaggerPlugin = FastifyPlugin(async (app) => {
	await app.register(FastifySwagger, swaggerOptions);

	await app.register(FastifySwaggerUi, {
		routePrefix: SWAGGER_UI_PREFIX,
	});
});
