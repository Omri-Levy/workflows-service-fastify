import { cleanupDatabase, tearDownDatabase } from "@/test/helpers/database-helper";
import { BusinessService } from "@/business/business.service";
import { BusinessRepository } from "@/business/business.repository";
import { db } from "@/db/client";
import { build } from "@/server";
import { WorkflowRuntimeDataRepository } from "@/workflow/workflow-runtime-data.repository";
import { WorkflowDefinitionRepository } from "@/workflow/workflow-definition.repository";
import { InjectOptions } from "fastify";

describe("/api/v1/external/businesses #api #integration #external", () => {
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

  describe("GET /:id", () => {
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

  describe("GET /:businessId/workflows", () => {
    it("should return 401 for unauthorized requests", async () => {

      // Arrange
      const injectOptions = {
        method: "GET",
        url: "/api/v1/external/businesses/1/workflows"
      } satisfies InjectOptions;

      // Act
      const res = await app.inject(injectOptions);


      // Assert
      expect(res.statusCode).toBe(401);
    });

    it.skip("should return 404 for non-existent business", async () => {

      // Arrange
      const injectOptions = {
        method: "GET",
        url: "/api/v1/external/businesses/1/workflows"
      } satisfies InjectOptions;

      // Act
      const res = await app.inject(injectOptions);


      // Assert
      expect(res.statusCode).toBe(404);
    });

    it("should return an empty array if no workflows are connected to the business", async () => {

      // Arrange
      const business = await businessService.create({
        data: {
          companyName: "test",
          registrationNumber: "0123456789"
        }
      });
      const injectOptions = {
        method: "GET",
        url: `/api/v1/external/businesses/${business.id}/workflows`
      } satisfies InjectOptions;

      // Act
      const res = await app.inject(injectOptions);
      const json = await res.json();

      // Assert
      expect(res.statusCode).toBe(200);
      expect(json).toEqual([]);
    });

    it("should return an array of workflows connected to the business", async () => {

      // Arrange
      const business = await businessService.create({
        data: {
          companyName: "test",
          registrationNumber: "0123456789"
        }
      });
      const workflowRuntimeDataRepository = new WorkflowRuntimeDataRepository(
        db
      );
      const workflowDefinitionRepository = new WorkflowDefinitionRepository(db);
      const workflowDefinition = await workflowDefinitionRepository.create({
        data: {
          definitionType: "statechart-json",
          name: "Manual review",
          definition: {}
        }
      });
      const workflow = await workflowRuntimeDataRepository.create({
        data: {
          workflowDefinitionVersion: 1,
          context: {},
          business: {
            connect: {
              id: business.id
            }
          },
          workflowDefinition: {
            connect: {
              id: workflowDefinition.id
            }
          }
        }
      });
      const injectOptions = {
        method: "GET",
        url: `/api/v1/external/businesses/${business.id}/workflows`
      } satisfies InjectOptions;

      // Act
      const res = await app.inject(injectOptions);
      const json = await res.json();

      // Assert
      expect(res.statusCode).toBe(200);
      expect(json).toEqual([
        {
          workflowRuntimeData: {
            ...workflow,
            createdAt: workflow.createdAt.toISOString(),
            updatedAt: workflow.updatedAt.toISOString()
          },
          workflowDefinition: {
            ...workflowDefinition,
            createdAt: workflowDefinition.createdAt.toISOString(),
            updatedAt: workflowDefinition.updatedAt.toISOString()
          }
        }
      ]);
    });
  });

  describe("POST /", () => {

    it("should return 401 for unauthorized requests", async () => {

      // Arrange
      const injectOptions = {
        method: "POST",
        url: "/api/v1/external/businesses",
        body: {}
      } satisfies InjectOptions;

      // Act
      const res = await app.inject(injectOptions);


      // Assert
      expect(res.statusCode).toBe(401);
    });

    it("should return 400 for missing required fields", async () => {

      // Arrange
      const injectOptions = {
        method: "POST",
        url: "/api/v1/external/businesses",
        body: {}
      } satisfies InjectOptions;

      // Act
      const res = await app.inject(injectOptions);


      // Assert
      expect(res.statusCode).toBe(400);
    });

    it("should return 400 for invalid fields", async () => {

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
      expect(res.statusCode).toBe(400);
    });

    it("creates a business", async () => {

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
        companyName: "test",
      });
      expect(business).toMatchObject({
        id: expect.any(String),
        companyName: "test",
        registrationNumber: "0123456789"
      });
    });

    // Currently `correlationId` is not passed at `create`, and `update` is not exposed
    it.skip("should return 400 for duplicate `correlationId`", async () => {

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
      expect(duplicateCorrelationIdRes.statusCode).toBe(400);
      expect(duplicateCorrelationIdJson.message).toBe("Correlation id already in use");
    });
  });
});
