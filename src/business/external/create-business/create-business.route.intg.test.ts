import { cleanupDatabase, tearDownDatabase } from "@/test/helpers/database-helper";
import { BusinessService } from "@/business/business.service";
import { BusinessRepository } from "@/business/business.repository";
import { db } from "@/db/client";
import { build, TApp } from "@/server";
import { InjectOptions } from "fastify";

describe("POST /api/v1/external/businesses #api #integration #external", () => {
  let app: TApp;
  const businessRepository = new BusinessRepository(
    db
  );
  const businessService = new BusinessService(
    businessRepository
  );

  beforeAll(async () => {
    app = await build();
  });
  beforeEach(async () => {
    await cleanupDatabase(db);
  });
  afterAll(async () => {
    await tearDownDatabase(db);
  });

  describe.skip("when unauthenticated", () => {
    it("should return 401", async () => {

      // Arrange
      const injectOptions = {
        method: "POST",
        url: "/api/v1/external/businesses",
        body: {}
      } satisfies InjectOptions;

      // Act
      const res = await app.inject(injectOptions);

      // Assert
      expect(res.statusCode).toEqual(401);
    });
  });

  describe("when missing required fields", () => {
    it("should return 400", async () => {

      // Arrange
      const injectOptions = {
        method: "POST",
        url: "/api/v1/external/businesses",
        body: {}
      } satisfies InjectOptions;

      // Act
      const res = await app.inject(injectOptions);

      // Assert
      expect(res.statusCode).toEqual(400);
    });
  });

  describe("when fields are invalid", () => {
    it("should return 400", async () => {

      // Arrange
      const injectOptions = {
        method: "POST",
        url: "/api/v1/external/businesses",
        body: {
          companyName: false,
          registrationNumber: {}
        }
      } satisfies InjectOptions;

      // Act
      const res = await app.inject(injectOptions);

      // Assert
      expect(res.statusCode).toEqual(400);
    });
  });

  describe("when fields are valid", () => {
    it("should create a business", async () => {

      // Arrange
      const injectOptions = {
        method: "POST",
        url: "/api/v1/external/businesses",
        body: {
          companyName: "test",
          registrationNumber: "0123456789"
        }
      } satisfies InjectOptions;

      // Act
      const res = await app.inject(injectOptions);
      const json = await res.json();
      const business = await businessService.getById(json.id);

      // Assert
      expect(res.statusCode).toBe(201);
      expect(json).toMatchObject({
        id: expect.any(String),
        companyName: "test"
      });
      expect(business).toMatchObject({
        id: expect.any(String),
        companyName: "test",
        registrationNumber: "0123456789"
      });
    });
  });

  // Currently `correlationId` is not passed at `create`, and `update` is not exposed
  describe.skip("when `correlationId` already exists", () => {
    it("should return 400", async () => {

      // Arrange
      const injectOptions = {
        method: "POST",
        url: "/api/v1/external/businesses",
        body: {
          companyName: "test",
          registrationNumber: "0123456789",
          correlationId: "test"
        }
      } satisfies InjectOptions;

      const duplicateCorrelationIdInjectOptions = {
        method: "POST",
        url: "/api/v1/external/businesses",
        body: {
          companyName: "test2",
          registrationNumber: "9876543210",
          correlationId: "test"
        }
      } satisfies InjectOptions;

      // Act
      await app.inject(injectOptions);
      const duplicateCorrelationIdRes = await app.inject(duplicateCorrelationIdInjectOptions);
      const duplicateCorrelationIdJson = await duplicateCorrelationIdRes.json();

      // Assert
      expect(duplicateCorrelationIdRes.statusCode).toEqual(400);
      expect(duplicateCorrelationIdJson.message).toEqual("Correlation id already in use");
    });
  });

});
