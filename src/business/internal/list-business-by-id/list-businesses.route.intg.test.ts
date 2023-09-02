import { cleanupDatabase, tearDownDatabase } from "@/test/helpers/database-helper";
import { BusinessService } from "@/business/business.service";
import { BusinessRepository } from "@/business/business.repository";
import { db } from "@/db/client";
import { build, TApp } from "@/server";
import { InjectOptions } from "fastify";
import { AuthSetupFn, setupAuth } from "@/test/setup-auth";

describe("GET /api/v1/internal/businesses #api #integration #internal", () => {
  let app: TApp;
  let authFn: AuthSetupFn;
  const businessRepository = new BusinessRepository(
    db
  );
  const businessService = new BusinessService(
    businessRepository
  );

  beforeAll(async () => {
    app = await build();
    authFn = setupAuth(app);
  });
  beforeEach(async () => {
    await cleanupDatabase(db);
    await authFn.createUser();
  });
  afterAll(async () => {
    await tearDownDatabase(db);
  });

  describe("when unauthenticated", () => {
    it("should return 401", async () => {

      // Arrange
      const injectOptions = {
        method: "GET",
        url: "/api/v1/internal/businesses"
      } satisfies InjectOptions;

      // Act
      const res = await app.inject(injectOptions);

      // Assert
      expect(res.statusCode).toEqual(401);
    });
  });

  describe("when no businesses exist", () => {
    it("should return an empty array", async () => {

      // Arrange
      const injectOptions = {
        method: "GET",
        url: "/api/v1/internal/businesses"
      } satisfies InjectOptions;

      // Act
      const authHeaders = await authFn.getHeaders();
      const res = await app.inject({
        ...injectOptions,
        ...authHeaders
      });

      const json = await res.json();

      // Assert
      expect(res.statusCode).toEqual(200);
      expect(json).toEqual([]);
    });
  });

  describe("when businesses exist", () => {
    it("should return an array of businesses", async () => {

      // Arrange
      await businessService.create({
        data: {
          companyName: "test",
          registrationNumber: "0123456789"
        }
      });

      await businessService.create({
        data: {
          companyName: "test2",
          registrationNumber: "1234567890"
        }
      });

      const injectOptions = {
        method: "GET",
        url: "/api/v1/internal/businesses"
      } satisfies InjectOptions;

      // Act
      const authHeaders = await authFn.getHeaders();
      const res = await app.inject({
        ...injectOptions,
        ...authHeaders
      });

      const json = await res.json();

      // Assert
      expect(res.statusCode).toEqual(200);
      expect(json).toEqual([
        expect.objectContaining({
          companyName: "test",
          registrationNumber: "0123456789"
        }),
        expect.objectContaining({
          companyName: "test2",
          registrationNumber: "1234567890"
        })
      ]);
    });
  });

});
