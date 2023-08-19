import { SwaggerOptions } from '@fastify/swagger';

export const swaggerOptions: SwaggerOptions = {
	openapi: {
		info: {
			title: 'Fastify Project',
			description: 'Fastify Project',
			version: '0.0.1',
		},
		components: {
			securitySchemes: {
				bearerAuth: {
					type: 'http',
					scheme: 'bearer',
				},
			},
		},
	},
};
