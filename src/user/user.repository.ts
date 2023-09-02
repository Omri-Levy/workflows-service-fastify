import { Db } from "@/db/client";
import { Prisma } from "@prisma/client";
import { PasswordService } from "../auth/password/password.service";
import { transformStringFieldUpdateInput } from "@/db/db.util";
import { UserCreateArgsSelectSubset, UserFindManyArgsSelectSubset } from "@/user/types";

export class UserRepository {
  constructor(
    protected readonly db: Db,
    protected readonly passwordService: PasswordService,
  ) {}

  async create<TArgs extends Prisma.UserCreateArgs>(
    args: UserCreateArgsSelectSubset<TArgs>,
  ) {
    return this.db.user.create<TArgs>({
      ...args,
      data: {
        ...args.data,
        // Use Prisma middleware
        password: await this.passwordService.hash(args.data.password),
      },
    });
  }

  async findMany<TArgs extends Prisma.UserFindManyArgs>(
    args?: UserFindManyArgsSelectSubset<TArgs>,
  ) {
    return this.db.user.findMany(args);
  }

  async findById<T extends Omit<Prisma.UserFindUniqueOrThrowArgs, 'where'>>(
    id: string,
    args?: Prisma.SelectSubset<T, Omit<Prisma.UserFindUniqueOrThrowArgs, 'where'>>,
  ) {
    return this.db.user.findUniqueOrThrow({
      where: { id },
      ...args,
    });
  }

  async findByEmail<T extends Omit<Prisma.UserFindUniqueArgs, 'where'>>(
    email: string,
    args?: Prisma.SelectSubset<T, Omit<Prisma.UserFindUniqueArgs, 'where'>>,
  ) {
    return this.db.user.findUnique({
      where: { email },
      ...args,
    });
  }

  async updateById<T extends Omit<Prisma.UserUpdateArgs, 'where'>>(
    id: string,
    args: Prisma.SelectSubset<T, Omit<Prisma.UserUpdateArgs, 'where'>>,
  ) {
    return this.db.user.update<T & { where: { id: string } }>({
      where: { id },
      ...args,
      data: {
        ...args.data,

        password:
          args.data.password &&
          (await transformStringFieldUpdateInput(args.data.password, password =>
            this.passwordService.hash(password),
          )),
      },
    });
  }

  async deleteById<T extends Omit<Prisma.UserDeleteArgs, 'where'>>(
    id: string,
    args?: Prisma.SelectSubset<T, Omit<Prisma.UserDeleteArgs, 'where'>>,
  ) {
    return this.db.user.delete({
      where: { id },
      ...args,
    });
  }

  async deleteManyByIds<T extends Omit<Prisma.UserDeleteManyArgs, 'where'>>(
    ids?: Array<string>,
    args?: Prisma.SelectSubset<T, Omit<Prisma.UserDeleteManyArgs, 'where'>>,
  ) {
    return this.db.user.deleteMany({
      ...(
        Array.isArray(ids) && !!ids?.length && {
          where: {
            id: {
              in: ids
            }
          }
        }
      ),
      ...args,
    });
  }

  async queryRaw<TValue>(query: string, values: any[] = []): Promise<TValue> {
    return (await this.db.$queryRawUnsafe.apply(this.db, [query, ...values])) as TValue;
  }
}
