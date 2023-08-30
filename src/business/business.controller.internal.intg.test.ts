import { cleanupDatabase, tearDownDatabase } from "@/test/helpers/database-helper";
import { BusinessService } from "@/business/business.service";
import { BusinessRepository } from "@/business/business.repository";
import { db } from "@/db/client";
import { build } from "@/server";
import { InjectOptions } from "fastify";

describe("/api/v1/internal/businesses #api #integration #internal", () => {
  let app: Awaited<ReturnType<typeof build>>;
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


  describe("GET /", () => {

    it("should return 401 for unauthorized requests", async () => {

      // Arrange
      const injectOptions = {
        method: "GET",
        url: "/api/v1/internal/businesses"
      } satisfies InjectOptions;

      // Act
      const res = await app.inject(injectOptions);


      // Assert
      expect(res.statusCode).toBe(401);
    });

    it("should return an empty array if no businesses exist", async () => {

      // Arrange
      const injectOptions = {
        method: "GET",
        url: "/api/v1/internal/businesses"
      } satisfies InjectOptions;

      // Act
      const res = await app.inject(injectOptions);

      const json = await res.json();

      // Assert
      expect(res.statusCode).toBe(200);
      expect(json).toEqual([]);
    });

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
      const res = await app.inject(injectOptions);

      const json = await res.json();

      // Assert
      expect(res.statusCode).toBe(200);
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

  describe("GET /:id", () => {
    it("should return 401 for unauthorized requests", async () => {

      // Arrange
      const injectOptions = {
        method: "GET",
        url: "/api/v1/internal/businesses/1"
      } satisfies InjectOptions;

      // Act
      const res = await app.inject(injectOptions);


      // Assert
      expect(res.statusCode).toBe(401);
    });

    it("should return 404 for non-existent business", async () => {

      // Arrange
      const injectOptions = {
        method: "GET",
        url: "/api/v1/internal/businesses/1"
      } satisfies InjectOptions;

      // Act
      const res = await app.inject(injectOptions);


      // Assert
      expect(res.statusCode).toBe(404);
    });

    it("should return a business", async () => {

      // Arrange
      const business = await businessService.create({
        data: {
          companyName: "test",
          registrationNumber: "0123456789"
        }
      });
      const injectOptions = {
        method: "GET",
        url: `/api/v1/internal/businesses/${business.id}`
      } satisfies InjectOptions;

      // Act
      const res = await app.inject(injectOptions);

      const json = await res.json();

      // Assert
      expect(res.statusCode).toBe(200);
      expect(json).toMatchObject({
        id: expect.any(String),
        companyName: "test",
        registrationNumber: "0123456789"
      });
    });
  });

});
