import { Type } from '@sinclair/typebox';
import { BusinessWhereInput } from './business-where-input';
import { BusinessOrderByInput } from './business-order-by-input';

export const BusinessFindManyArgs = Type.Object({
  where: Type.Optional(BusinessWhereInput),
  orderBy: Type.Optional(Type.Array(BusinessOrderByInput)),
  skip: Type.Optional(Type.Number()),
  take: Type.Optional(Type.Number())
});