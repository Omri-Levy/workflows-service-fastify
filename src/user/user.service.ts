import { Prisma } from "@prisma/client";
import { UserRepository } from "./user.repository";
import { UserCreateArgsSelectSubset, UserFindManyArgsSelectSubset } from "@/user/types";

export class UserService {
  constructor(
    protected readonly userRepository: UserRepository,
  ) {}

  async create<TArgs extends Prisma.UserCreateArgs>(args: UserCreateArgsSelectSubset<TArgs>) {
    return this.userRepository.create<TArgs>(args);
  }

  async list<TArgs extends Prisma.UserFindManyArgs>(args?: UserFindManyArgsSelectSubset<TArgs>) {
    return this.userRepository.findMany<TArgs>(args);
  }

  async getById(id: string, args?: Parameters<UserRepository['findById']>[1]) {
    return this.userRepository.findById(id, args);
  }

  async getByEmail(email: string, args?: Parameters<UserRepository['findByEmail']>[1]) {
    return this.userRepository.findByEmail(email, args);
  }

  async updateById(id: string, args: Parameters<UserRepository['updateById']>[1]) {
    return this.userRepository.updateById(id, args);
  }

  async deleteById(id: string, args?: Parameters<UserRepository['deleteById']>[1]) {
    return this.userRepository.deleteById(id, args);
  }
}
