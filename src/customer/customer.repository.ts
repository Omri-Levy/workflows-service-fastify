import { Customer, Prisma } from '@prisma/client';
import { CustomerWithProjects } from '@/types';
import { Db } from "@/db/client";

export class CustomerRepository {
  constructor(protected readonly db: Db) {}

  async create<T extends Prisma.CustomerCreateArgs>(
    args: Prisma.SelectSubset<T, Prisma.CustomerCreateArgs>,
  ): Promise<Customer> {
    // @ts-expect-error - prisma json not updated
    await this.validateApiKey(args.data?.authenticationConfiguration?.authValue);

    return this.db.customer.create<T>(args);
  }

  async validateApiKey(apiKey?: string) {
    if (apiKey === undefined) return;

    if (apiKey.length < 4) throw new Error('Invalid API key');

    const customerApiAlreadyExists = await this.findByApiKey(apiKey);
    if (customerApiAlreadyExists) throw new Error('API key already exists');
  }

  async findMany<T extends Prisma.CustomerFindManyArgs>(
    args?: Prisma.SelectSubset<T, Prisma.CustomerFindManyArgs>,
  ): Promise<Customer[]> {
    return this.db.customer.findMany(args);
  }

  async findById<T extends Omit<Prisma.CustomerFindUniqueOrThrowArgs, 'where'>>(
    id: string,
    args?: Prisma.SelectSubset<T, Omit<Prisma.CustomerFindUniqueOrThrowArgs, 'where'>>,
  ): Promise<Customer> {
    return this.db.customer.findUniqueOrThrow({
      where: { id },
      ...args,
    });
  }

  async findByProjectId<T extends Omit<Prisma.CustomerFindFirstArgsBase, 'where'>>(
    projectId: string,
    args?: Prisma.SelectSubset<T, Omit<Prisma.CustomerFindFirstArgsBase, 'where'>>,
  ): Promise<Customer | null> {
    return this.db.customer.findFirst({
      where: { projects: { some: { id: projectId } } },
      ...args,
    });
  }

  async findByName<T extends Omit<Prisma.CustomerFindUniqueArgs, 'where'>>(
    name: string,
    args?: Prisma.SelectSubset<T, Omit<Prisma.CustomerFindUniqueArgs, 'where'>>,
  ): Promise<any> {
    return this.db.customer.findUnique({
      where: { name },
      ...args,
    });
  }

  async findByApiKey<T extends Omit<Prisma.CustomerFindFirstArgs, 'where'>>(
    apiKey: string,
  ): Promise<CustomerWithProjects | null> {
    return this.db.customer.findFirst({
      where: {
        authenticationConfiguration: {
          path: ['authValue'],
          equals: apiKey,
        },
      },
      select: {
        id: true,
        name: true,
        authenticationConfiguration: true,
        displayName: true,
        logoImageUri: true,
        customerStatus: true,
        country: true,
        language: true,
        projects: true,
      },
    });
  }

  async updateById<T extends Omit<Prisma.CustomerUpdateArgs, 'where'>>(
    id: string,
    args: Prisma.SelectSubset<T, Omit<Prisma.CustomerUpdateArgs, 'where'>>,
  ): Promise<Customer> {
    // @ts-expect-error - prisma json not updated
    await this.validateApiKey(args.data?.authenticationConfiguration?.authValue);

    return this.db.customer.update<T & { where: { id: string } }>({
      where: { id },
      ...args,
      data: {
        ...args.data,
      },
    });
  }

  async deleteById<T extends Omit<Prisma.CustomerDeleteArgs, 'where'>>(
    id: string,
    args?: Prisma.SelectSubset<T, Omit<Prisma.CustomerDeleteArgs, 'where'>>,
  ): Promise<Customer> {
    return this.db.customer.delete({
      where: { id },
      ...args,
    });
  }

  async queryRaw<TValue>(query: string, values: any[] = []): Promise<TValue> {
    return (await this.db.$queryRawUnsafe.apply(this.db, [query, ...values])) as TValue;
  }
}
