import { AsyncLocalStorage } from 'node:async_hooks';

export type RequestContext = {
	requestId: string;
};

const requestContextAsyncLocalStorage = new AsyncLocalStorage<RequestContext>();

export const startRequestContext = (
	context: RequestContext,
	callback: () => unknown,
) => {
	requestContextAsyncLocalStorage.run(context, callback);
};

export const getRequestContext = () => {
	return requestContextAsyncLocalStorage.getStore();
};
