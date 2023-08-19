/* eslint-disable @typescript-eslint/no-unsafe-call */
import { mock } from 'jest-mock-extended';
import { PrismaService } from 'nestjs-prisma';
import { HealthService } from './health.service';
import { Db } from "@/db/client";

describe('Testing the HealthService', () => {
  let db: Db;
  let healthService: HealthService;

  describe('Testing the isDbReady function in HealthService class', () => {
    beforeEach(() => {
      db = mock<PrismaService>();
      healthService = new HealthService(db);
    });
    it('should return true if allow connection to db', async () => {
      // Arrange
      (db.$queryRaw as jest.Mock).mockReturnValue(Promise.resolve(true));

      // Act
      const response = await healthService.isDbReady();

      // Assert
      expect(response).toBe(true);
    });
    it('should return false if db is not available', async () => {
      // Arrange
      (db.$queryRaw as jest.Mock).mockReturnValue(Promise.reject(false));

      // Act
      const response = await healthService.isDbReady();

      // Assert
      expect(response).toBe(false);
    });
  });
});
