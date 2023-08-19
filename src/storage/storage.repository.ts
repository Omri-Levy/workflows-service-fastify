import { Prisma } from "@prisma/client";
import { Db } from "@/db/client";
import { IFileIds } from "./types";

export class FileRepository {
  constructor(protected readonly db: Db) {}

  async create<T extends Prisma.FileCreateArgs>(
    args: Prisma.SelectSubset<T, Prisma.FileCreateArgs>,
  ) {
    return await this.db.file.create<T>(args);
  }

  async findMany<T extends Prisma.FileFindManyArgs>(
    args?: Prisma.SelectSubset<T, Prisma.FileFindManyArgs>,
  ) {
    return await this.db.file.findMany(args);
  }

  async findById<T extends Omit<Prisma.FileFindFirstArgs, 'where'>>(
    { id }: IFileIds,
    args?: Prisma.SelectSubset<T, Omit<Prisma.FileFindFirstArgs, 'where'>>,
  ) {
    return await this.db.file.findFirst({
      where: { id },
      ...args,
    });
  }

  async findNameById({ id }: IFileIds) {
    return await this.findById(
      { id },
      {
        select: {
          fileNameOnDisk: true,
          uri: true,
          fileNameInBucket: true,
          id: true,
        },
      },
    );
  }
}
