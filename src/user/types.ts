import { Prisma } from "@prisma/client";

export type UserCreateArgsSelectSubset<TGeneric extends Prisma.UserCreateArgs> = Prisma.SelectSubset<TGeneric, Prisma.UserCreateArgs>;

export type UserFindManyArgsSelectSubset<TGeneric extends Prisma.UserFindManyArgs> = Prisma.SelectSubset<TGeneric, Prisma.UserFindManyArgs>;