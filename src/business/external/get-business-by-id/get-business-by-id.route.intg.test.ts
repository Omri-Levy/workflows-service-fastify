import { cleanupDatabase, tearDownDatabase } from "@/test/helpers/database-helper";
import { BusinessService } from "@/business/business.service";
import { BusinessRepository } from "@/business/business.repository";
import { db } from "@/db/client";
import { build } from "@/server";
import { InjectOptions } from "fastify";

describe("GET /api/v1/external/businesses/:id #api #integration #external", () => {
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

  it("should return 401 for unauthorized requests", async () => {

    // Arrange
    const injectOptions = {
      method: "GET",
      url: "/api/v1/external/businesses/1"
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
      url: "/api/v1/external/businesses/1"
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
      url: `/api/v1/external/businesses/${business.id}`
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
