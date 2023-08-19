import { Db } from "@/db/client";

export class HealthService {
  constructor(protected readonly db: Db) {
  }

  async isDbReady() {
    try {
      await this.db.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      return false;
    }
  }
}
