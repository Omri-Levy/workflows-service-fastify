import type { JsonValue } from 'type-fest';

export type InputJsonValue = Omit<JsonValue, 'null'>;

export interface IObjectWithId {
  id: string;
}

export type InferArrayItem<TArray> = TArray extends Array<infer TItem> ? TItem : never;
