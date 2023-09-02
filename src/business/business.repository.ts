import { Prisma } from "@prisma/client";
import { Db } from "@/db/client";

export class BusinessRepository {
  constructor(protected readonly db: Db) {}

  async create<T extends Prisma.BusinessCreateArgs>(
    args: Prisma.SelectSubset<T, Prisma.BusinessCreateArgs>,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await this.db.business.create(args);
  }

  async findMany<T extends Prisma.BusinessFindManyArgs>(
    args?: Prisma.SelectSubset<T, Prisma.BusinessFindManyArgs>,
  ) {
    return await this.db.business.findMany(args);
  }

  async findById<T extends Omit<Prisma.BusinessFindUniqueOrThrowArgs, 'where'>>(
    id: string,
    args?: Prisma.SelectSubset<T, Omit<Prisma.BusinessFindUniqueOrThrowArgs, 'where'>>,
  ) {
    return await this.db.business.findUniqueOrThrow({
      where: { id },
      ...args,
    });
  }

  async findByCorrelationId<T extends Omit<Prisma.BusinessFindUniqueOrThrowArgs, 'where'>>(
    id: string,
    args?: Prisma.SelectSubset<T, Omit<Prisma.BusinessFindUniqueOrThrowArgs, 'where'>>,
  ) {
    return await this.db.business.findUnique({
      where: { correlationId: id },
      ...args,
    });
  }

  async getCorrelationIdById(id: string): Promise<string | null> {
    return (
      await this.db.business.findUniqueOrThrow({
        where: { id },
        select: { correlationId: true },
      })
    ).correlationId;
  }

  async updateById<T extends Omit<Prisma.BusinessUpdateArgs, 'where'>>(
    id: string,
    args: Prisma.SelectSubset<T, Omit<Prisma.BusinessUpdateArgs, 'where'>>,
  )  {
    return await this.db.business.update({
      where: { id },
      ...args,
    });
  }
}
