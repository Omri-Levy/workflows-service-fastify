import { BusinessRepository } from "./business.repository";

export class BusinessService {
  constructor(protected readonly businessRepository: BusinessRepository) {
  }

  async create(args: Parameters<BusinessRepository["create"]>[0]) {
    return await this.businessRepository.create(args);
  }

  async list(args?: Parameters<BusinessRepository["findMany"]>[0]) {
    return await this.businessRepository.findMany(args);
  }

  async getById(id: string, args?: Parameters<BusinessRepository["findById"]>[1]) {
    return await this.businessRepository.findById(id, args);
  }
}
