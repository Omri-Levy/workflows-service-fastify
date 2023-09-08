import { Customer, Project, User, UserToProject } from '@prisma/client';
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

export type UserWithProjects = User & { userToProjects?: Omit<UserToProject[], 'userId'> };

export type CustomerWithProjectIds = Customer & { projectIds: TProjectIds };

export type CustomerWithProjects = Partial<Customer & { projects: Array<Project> }>;

export type AuthenticatedEntity = {
  user?: Partial<User>;
  customer?: Partial<Customer>;
  projectIds: TProjectIds;
  type: 'user' | 'customer' | 'admin';
};