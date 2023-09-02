import { cleanupDatabase, tearDownDatabase } from "@/test/helpers/database-helper";
import { BusinessService } from "@/business/business.service";
import { BusinessRepository } from "@/business/business.repository";
import { db } from "@/db/client";
import { build } from "@/server";
import { WorkflowRuntimeDataRepository } from "@/workflow/workflow-runtime-data.repository";
import { WorkflowDefinitionRepository } from "@/workflow/workflow-definition.repository";
import { InjectOptions } from "fastify";

describe("GET /api/v1/external/businesses #api #integration #external", () => {
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
      url: "/api/v1/external/businesses"
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
      url: "/api/v1/external/businesses"
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
        registrationNumber: "9876543210"
      }
    });
    const injectOptions = {
      method: "GET",
      url: "/api/v1/external/businesses"
    } satisfies InjectOptions;

    // Act
    const res = await app.inject(injectOptions);
    const json = await res.json();

    // Assert
    expect(res.statusCode).toBe(200);
    expect(json).toEqual([
      expect.objectContaining({
        id: expect.any(String),
        companyName: "test",
        registrationNumber: "0123456789"
      }),
      expect.objectContaining({
        id: expect.any(String),
        companyName: "test2",
        registrationNumber: "9876543210"
      })
    ]);
  });

});
