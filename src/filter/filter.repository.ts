import { Prisma } from "@prisma/client";
import { FilterModel } from "./filter.model";
import { Db } from "@/db/client";

export class FilterRepository {
  constructor(protected readonly db: Db) {
  }

  async create<T extends Prisma.FilterCreateArgs>(
    args: Prisma.SelectSubset<T, Prisma.FilterCreateArgs>
  ) {
    return await this.db.filter.create(args);
  }

  async findMany<T extends Prisma.FilterFindManyArgs>(
    args?: Prisma.SelectSubset<T, Prisma.FilterFindManyArgs>
  ) {
    return await this.db.filter.findMany(args);
  }

  async findById<T extends Omit<Prisma.FilterFindUniqueOrThrowArgs, "where">>(
    id: string,
    args?: Prisma.SelectSubset<T, Omit<Prisma.FilterFindUniqueOrThrowArgs, "where">>
  ) {
    return await this.db.filter.findUniqueOrThrow({
      where: { id },
      ...args
    });
  }

  async updateById<T extends Omit<Prisma.FilterUpdateArgs, "where">>(
    id: string,
    args: Prisma.SelectSubset<T, Omit<Prisma.FilterUpdateArgs, "where">>
  ): Promise<FilterModel> {
    return await this.db.filter.update({
      where: { id },
      ...args
    });
  }
}
