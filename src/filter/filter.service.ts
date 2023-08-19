import { FilterRepository } from "@/filter/filter.repository";

export class FilterService {
  constructor(protected readonly filterRepository: FilterRepository) {
  }

  async create(args: Parameters<FilterRepository["create"]>[0]) {
    return await this.filterRepository.create(args);
  }

  async list(args?: Parameters<FilterRepository["findMany"]>[0]) {
    return await this.filterRepository.findMany(args);
  }

  async getById(id: string, args?: Parameters<FilterRepository["findById"]>[1]) {
    return await this.filterRepository.findById(id, args);
  }
}
