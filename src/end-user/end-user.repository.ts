import { Prisma } from "@prisma/client";
import { EndUserModel } from "./end-user.model";
import { db } from "@/db/client";

type Db = typeof db;

export class EndUserRepository {

  constructor(
    private readonly db: Db
  ) {
  }

  async create<T extends Prisma.EndUserCreateArgs>(
    args: Prisma.SelectSubset<T, Prisma.EndUserCreateArgs>,
  ) {
    return await this.db.endUser.create(args);
  }

  async findMany<T extends Prisma.EndUserFindManyArgs>(
    args?: Prisma.SelectSubset<T, Prisma.EndUserFindManyArgs>,
  ) {
    return await this.db.endUser.findMany(args);
  }

  async findById<T extends Omit<Prisma.EndUserFindUniqueOrThrowArgs, 'where'>>(
    id: string,
    args?: Prisma.SelectSubset<T, Omit<Prisma.EndUserFindUniqueOrThrowArgs, 'where'>>,
  ) {
    return await this.db.endUser.findUniqueOrThrow({
      where: { id },
      ...args,
    });
  }

  async findByCorrelationId<T extends Omit<Prisma.EndUserFindUniqueOrThrowArgs, 'where'>>(
    id: string,
    args?: Prisma.SelectSubset<T, Omit<Prisma.EndUserFindUniqueOrThrowArgs, 'where'>>,
  ) {
    return await this.db.endUser.findUnique({
      where: { correlationId: id },
      ...args,
    });
  }

  async updateById<T extends Omit<Prisma.EndUserUpdateArgs, 'where'>>(
    id: string,
    args: Prisma.SelectSubset<T, Omit<Prisma.EndUserUpdateArgs, 'where'>>,
  ): Promise<EndUserModel> {
    return await this.db.endUser.update({
      where: { id },
      ...args,
    });
  }

  async getCorrelationIdById(id: string): Promise<string | null> {
    return (
      await this.db.endUser.findUniqueOrThrow({
        where: { id },
        select: { correlationId: true },
      })
    ).correlationId;
  }
}