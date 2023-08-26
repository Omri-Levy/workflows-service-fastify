import { pino } from 'pino';

import { config } from '../config/config';
import { getRequestContext } from '../request-context/request-context';
import { env } from "@/env";

export type LoggerInterface = ReturnType<typeof createLoggerInstance>;

class LazyLogger implements ProxyHandler<LoggerInterface> {
	private loggerInstance: LoggerInterface | undefined;

	public get(_: LoggerInterface, property: keyof LoggerInterface) {
		this.loggerInstance ??= createLoggerInstance();

		const requestContext = getRequestContext();

		if (requestContext) {
			// @TODO: Re-use the child logger.
			const childLogger = this.loggerInstance.child({
				requestId: requestContext.requestId,
			});

			return Reflect.get(childLogger, property);
		}

		return Reflect.get(this.loggerInstance, property);
	}
}

// The logger is lazy loaded to prevent it from being loaded before mocking the stdout stream in automated tests.
export const logger = new Proxy({} as LoggerInterface, new LazyLogger());

function createLoggerInstance() {
	return pino({
		messageKey: 'message',
		errorKey: 'error',
		level: env.NODE_ENV === 'test' ? 'error' : config.log.level,
		/* c8 ignore start */
		...(config.log.enablePretty
			? {
					transport: {
						target: 'pino-pretty',
						options: {
							messageKey: 'message',
						},
					},
			  }
			: {}),
		/* c8 ignore stop */
		hooks: {
			logMethod(inputArguments, method) {
				if (inputArguments.length >= 2) {
					// Flip the first two parameters of the log method.
					return Reflect.apply(method, this, [
						inputArguments[1] as (typeof inputArguments)[0],
						inputArguments[0] as (typeof inputArguments)[1],
						...inputArguments.slice(2),
					]);
				}

				return method.apply(this, inputArguments);
			},
		},
		formatters: {
			bindings: (bindings) => {
				return {
					...bindings,
					environment: config.environmentName,
				};
			},
		},
	});
}
