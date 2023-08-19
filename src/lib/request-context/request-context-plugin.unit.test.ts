// migrate to vitest
// import Fastify, { FastifyInstance, InjectOptions } from 'fastify';
// import { beforeEach, describe, expect, it } from 'vitest';
//
// import { getRequestContext, RequestContext } from './request-context';
// import { RequestContextPlugin } from './request-context-plugin';
//
// let app: FastifyInstance;
//
// describe('RequestContextPlugin', () => {
// 	beforeEach(async () => {
// 		app = Fastify();
//
// 		await app.register(RequestContextPlugin);
// 	});
//
// 	describe('When a request is received', () => {
// 		it('Should set the request context', async () => {
// 			// Arrange
// 			let context!: RequestContext;
// 			const request: InjectOptions = {
// 				method: 'GET',
// 				url: '/',
// 				headers: {
// 					'x-request-id': 'req-1',
// 				},
// 			};
// 			app.route({
// 				method: 'GET',
// 				url: '/',
// 				handler: () => {
// 					context = getRequestContext()!;
//
// 					return { hello: 'world' };
// 				},
// 			});
//
// 			// Act
// 			await app.inject(request);
//
// 			// Assert
// 			expect(context).toEqual({
// 				requestId: 'req-1',
// 			});
// 		});
// 	});
// });
