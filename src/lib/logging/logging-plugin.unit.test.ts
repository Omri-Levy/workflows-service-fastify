// migrate to vitest
// import Fastify, { FastifyInstance, InjectOptions } from 'fastify';
// import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
//
// import { RequestContextPlugin } from '../request-context/request-context-plugin';
// import { LoggingPlugin } from './logging-plugin';
//
// function spyOnStdoutWrite() {
// 	return vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
// }
//
// let app: FastifyInstance;
//
// const METHODS = [
// 	'GET',
// 	'POST',
// 	'PUT',
// 	'PATCH',
// 	'DELETE',
// 	'HEAD',
// 	'OPTIONS',
// ] as const;
//
// describe(LoggingPlugin.name, () => {
// 	beforeEach(async () => {
// 		app = Fastify();
//
// 		await app.register(RequestContextPlugin);
// 		await app.register(LoggingPlugin);
// 	});
//
// 	afterEach(() => {
// 		vi.restoreAllMocks();
// 	});
//
// 	describe.each(METHODS)('When a %s request is received', (method) => {
// 		it('Should log the request and the response', async () => {
// 			// Arrange
// 			const stdoutWriteSpy = spyOnStdoutWrite();
// 			const request: InjectOptions = {
// 				method,
// 				url: '/',
// 				headers: {
// 					'x-request-id': 'req-1',
// 				},
// 			};
// 			app.route({
// 				method,
// 				url: '/',
// 				handler: () => {
// 					return { hello: 'world' };
// 				},
// 			});
//
// 			// Act
// 			await app.inject(request);
//
// 			// Assert
// 			expect(stdoutWriteSpy.mock.calls).toHaveLength(2);
//
// 			const requestLogObject = JSON.parse(
// 				stdoutWriteSpy.mock.calls[0]?.[0] as string,
// 			) as any;
// 			expect(requestLogObject).toContain({
// 				message: 'Incoming request',
// 				level: 30,
// 				requestId: 'req-1',
// 			});
// 			expect(requestLogObject.request).toEqual({
// 				method,
// 				url: '/',
// 			});
//
// 			const responseLogObject = JSON.parse(
// 				stdoutWriteSpy.mock.calls[1]?.[0] as string,
// 			) as any;
// 			expect(responseLogObject).toContain({
// 				message: 'Outgoing response',
// 				level: 30,
// 				requestId: 'req-1',
// 			});
// 			expect(responseLogObject.response).toEqual({
// 				statusCode: 200,
// 			});
// 		});
// 	});
//
// 	describe('When an error is thrown while processing a request', () => {
// 		it('Should log the error', async () => {
// 			// Arrange
// 			const stdoutWriteSpy = spyOnStdoutWrite();
// 			const request: InjectOptions = {
// 				method: 'GET',
// 				url: '/',
// 				headers: {
// 					'x-request-id': 'req-1',
// 				},
// 			};
// 			app.get('/', () => {
// 				throw new Error('Some error');
// 			});
//
// 			// Act
// 			await app.inject(request);
//
// 			// Assert
// 			expect(stdoutWriteSpy.mock.calls).toHaveLength(3);
//
// 			const errorLogObject = JSON.parse(
// 				stdoutWriteSpy.mock.calls[1]?.[0] as string,
// 			) as any;
//
// 			expect(errorLogObject).toContain({
// 				message: 'Request error',
// 				level: 30,
// 				requestId: 'req-1',
// 			});
// 			expect(errorLogObject.error).toEqual({
// 				message: 'Some error',
// 				stack: expect.any(String),
// 				type: 'Error',
// 			});
// 		});
// 	});
//
// 	describe('When a request is received to a route that does not exist', () => {
// 		it('Should log the request and the response', async () => {
// 			// Arrange
// 			const stdoutWriteSpy = spyOnStdoutWrite();
// 			const request: InjectOptions = {
// 				method: 'GET',
// 				url: '/not-found',
// 				headers: {
// 					'x-request-id': 'req-1',
// 				},
// 			};
//
// 			// Act
// 			await app.inject(request);
//
// 			// Assert
// 			expect(stdoutWriteSpy.mock.calls).toHaveLength(2);
//
// 			const requestLogObject = JSON.parse(
// 				stdoutWriteSpy.mock.calls[0]?.[0] as string,
// 			) as any;
// 			expect(requestLogObject).toContain({
// 				message: 'Incoming request',
// 				level: 30,
// 				requestId: 'req-1',
// 			});
// 			expect(requestLogObject?.request).toEqual({
// 				method: 'GET',
// 				url: '/not-found',
// 			});
//
// 			const responseLogObject = JSON.parse(
// 				stdoutWriteSpy.mock.calls[1]?.[0] as string,
// 			) as any;
// 			expect(responseLogObject).toContain({
// 				message: 'Outgoing response',
// 				level: 30,
// 				requestId: 'req-1',
// 			});
// 			expect(responseLogObject?.response).toEqual({
// 				statusCode: 404,
// 			});
// 		});
// 	});
// });
