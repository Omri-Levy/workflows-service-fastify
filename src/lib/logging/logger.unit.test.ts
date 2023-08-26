// migrate to vitest
// import { afterEach, describe, expect, it, SpyInstance, vi } from 'vitest';
//
// import { logger } from './logger';
//
// function spyOnStdoutWrite() {
// 	return vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
// }
//
// function assertStdoutWriteCalledOnceWith(
// 	stdoutWriteSpy: SpyInstance,
// 	expected: Record<string, unknown>,
// ) {
// 	expect(stdoutWriteSpy.mock.calls).toHaveLength(1);
//
// 	const log = stdoutWriteSpy.mock.calls[0];
//
// 	expect(log?.length).toBe(1);
//
// 	expect(JSON.parse(log?.[0] as string)).toContain(expected);
// }
//
// describe('logger', () => {
// 	afterEach(() => {
// 		vi.restoreAllMocks();
// 	});
//
// 	describe('When `trace` is called', () => {
// 		it('Should log the message with level 10', () => {
// 			// Arrange
// 			const stdoutWriteSpy = spyOnStdoutWrite();
//
// 			// Act
// 			logger.trace('Hello world', { foo: 'bar' });
//
// 			// Assert
// 			assertStdoutWriteCalledOnceWith(stdoutWriteSpy, {
// 				message: 'Hello world',
// 				environment: 'development',
// 				foo: 'bar',
// 				level: 10,
// 			});
// 		});
// 	});
//
// 	describe('When `debug` is called', () => {
// 		it('Should log the message with level 20', () => {
// 			// Arrange
// 			const stdoutWriteSpy = spyOnStdoutWrite();
//
// 			// Act
// 			logger.debug('Hello world', { foo: 'bar' });
//
// 			// Assert
// 			assertStdoutWriteCalledOnceWith(stdoutWriteSpy, {
// 				message: 'Hello world',
// 				environment: 'development',
// 				foo: 'bar',
// 				level: 20,
// 			});
// 		});
// 	});
//
// 	describe('When `info` is called', () => {
// 		it('Should log the message with level 30', () => {
// 			// Arrange
// 			const stdoutWriteSpy = spyOnStdoutWrite();
//
// 			// Act
// 			logger.info('Hello world', { foo: 'bar' });
//
// 			// Assert
// 			assertStdoutWriteCalledOnceWith(stdoutWriteSpy, {
// 				message: 'Hello world',
// 				environment: 'development',
// 				foo: 'bar',
// 				level: 30,
// 			});
// 		});
// 	});
//
// 	describe('When `warn` is called', () => {
// 		it('Should log the message with level 40', () => {
// 			// Arrange
// 			const stdoutWriteSpy = spyOnStdoutWrite();
//
// 			// Act
// 			logger.warn('Hello world', { foo: 'bar' });
//
// 			// Assert
// 			assertStdoutWriteCalledOnceWith(stdoutWriteSpy, {
// 				message: 'Hello world',
// 				environment: 'development',
// 				foo: 'bar',
// 				level: 40,
// 			});
// 		});
// 	});
//
// 	describe('When `error` is called', () => {
// 		it('Should log the message with level 50', () => {
// 			// Arrange
// 			const stdoutWriteSpy = spyOnStdoutWrite();
//
// 			// Act
// 			logger.error('Hello world', { foo: 'bar' });
//
// 			// Assert
// 			assertStdoutWriteCalledOnceWith(stdoutWriteSpy, {
// 				message: 'Hello world',
// 				environment: 'development',
// 				foo: 'bar',
// 				level: 50,
// 			});
// 		});
// 	});
//
// 	describe('When `fatal` is called', () => {
// 		it('Should log the message with level 60', () => {
// 			// Arrange
// 			const stdoutWriteSpy = spyOnStdoutWrite();
//
// 			// Act
// 			logger.fatal('Hello world', { foo: 'bar' });
//
// 			// Assert
// 			assertStdoutWriteCalledOnceWith(stdoutWriteSpy, {
// 				message: 'Hello world',
// 				environment: 'development',
// 				foo: 'bar',
// 				level: 60,
// 			});
// 		});
// 	});
//
// 	describe('When child is called', () => {
// 		it('Should return a new child logging with extended context', () => {
// 			// Arrange
// 			const stdoutWriteSpy = spyOnStdoutWrite();
//
// 			// Act
// 			const child = logger.child({ foo: 'bar' }).child({ bar: 'baz' });
// 			child.info('Hello world');
//
// 			// Assert
// 			expect(child).not.toBe(logger);
// 			assertStdoutWriteCalledOnceWith(stdoutWriteSpy, {
// 				message: 'Hello world',
// 				environment: 'development',
// 				level: 30,
// 				foo: 'bar',
// 				bar: 'baz',
// 			});
// 		});
// 	});
//
// 	describe('When logging is called with an object argument', () => {
// 		it('Should log the serialized object', () => {
// 			// Arrange
// 			const stdoutWriteSpy = spyOnStdoutWrite();
//
// 			// Act
// 			logger.info({ foo: 'bar' });
//
// 			// Assert
// 			assertStdoutWriteCalledOnceWith(stdoutWriteSpy, {
// 				foo: 'bar',
// 				level: 30,
// 			});
// 		});
// 	});
//
// 	describe('When logging is called with an error argument', () => {
// 		it('Should log the serialized error', () => {
// 			// Arrange
// 			const stdoutWriteSpy = spyOnStdoutWrite();
//
// 			// Act
// 			logger.info(new Error('Some error'));
//
// 			// Assert
// 			assertStdoutWriteCalledOnceWith(stdoutWriteSpy, {
// 				message: 'Some error',
// 				level: 30,
// 			});
//
// 			const logObject = JSON.parse(
// 				stdoutWriteSpy.mock.calls[0]?.[0] as string,
// 			) as any;
// 			expect(logObject).toHaveProperty('error');
// 			expect(logObject?.error).MatchObject({
// 				message: 'Some error',
// 				stack: expect.any(String),
// 				type: 'Error',
// 			});
// 		});
// 	});
// });
