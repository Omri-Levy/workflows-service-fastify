import { EndUserRepository } from "@/end-user/end-user.repository";


export class EndUserService {

  constructor(
    private readonly endUserRepository: EndUserRepository
  ) {
  }

  async create(args: Parameters<EndUserRepository["create"]>[0]) {
    return await this.endUserRepository.create(args);
  }

  async list(args?: Parameters<EndUserRepository["findMany"]>[0]) {
    return await this.endUserRepository.findMany(args);
  }

  async getById(id: string, args?: Parameters<EndUserRepository["findById"]>[1]) {
    return await this.endUserRepository.findById(id, args);
  }
}