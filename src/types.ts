import type { JsonValue } from 'type-fest';

export type InputJsonValue = Omit<JsonValue, 'null'>;

export interface IObjectWithId {
  id: string;
}

export type InferArrayItem<TArray> = TArray extends Array<infer TItem> ? TItem : never;

export type AnyFunction = (...args: Array<any>) => any;

export type FirstParameter<TFn extends AnyFunction> = Parameters<TFn>[0];

export type TProjectId = string;

export type TProjectIds = Array<TProjectId>;