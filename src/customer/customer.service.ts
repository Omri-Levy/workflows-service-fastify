import { CustomerRepository } from "@/customer/customer.repository";
import { Prisma } from "@prisma/client";

export class CustomerService {
  constructor(private readonly customerRepository: CustomerRepository) {
  }

  async create(args: Parameters<CustomerRepository["create"]>[0]) {
    return this.customerRepository.create(args);
  }

  async list(args?: Parameters<CustomerRepository["findMany"]>[0]) {
    return this.customerRepository.findMany(args);
  }

  async getById(id: string, args?: Parameters<CustomerRepository["findById"]>[1]) {
    return this.customerRepository.findById(id, args);
  }

  async getByApiKey(apiKey: string) {
    return this.customerRepository.findByApiKey(apiKey);
  }

  async getByProjectId(projectId: string, args?: Omit<Prisma.CustomerFindFirstArgsBase, "where">) {
    return this.customerRepository.findByProjectId(projectId, args);
  }

  async updateById(id: string, args: Parameters<CustomerRepository["updateById"]>[1]) {
    return this.customerRepository.updateById(id, args);
  }

  async deleteById(id: string, args?: Parameters<CustomerRepository["deleteById"]>[1]) {
    return this.customerRepository.deleteById(id, args);
  }
}
