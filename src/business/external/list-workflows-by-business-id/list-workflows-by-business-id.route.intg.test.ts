import { cleanupDatabase, tearDownDatabase } from "@/test/helpers/database-helper";
import { BusinessService } from "@/business/business.service";
import { BusinessRepository } from "@/business/business.repository";
import { db } from "@/db/client";
import { build, TApp } from "@/server";
import { WorkflowRuntimeDataRepository } from "@/workflow/workflow-runtime-data.repository";
import { WorkflowDefinitionRepository } from "@/workflow/workflow-definition.repository";
import { InjectOptions } from "fastify";

describe("GET /api/v1/external/businesses/:businessId/workflows #api #integration #external", () => {
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
        method: "GET",
        url: "/api/v1/external/businesses/1/workflows"
      } satisfies InjectOptions;

      // Act
      const res = await app.inject(injectOptions);

      // Assert
      expect(res.statusCode).toEqual(401);

    });
  });

  // Not covered by application code
  describe.skip("when the business does not exist", () => {
    it("should return 404", async () => {

      // Arrange
      const injectOptions = {
        method: "GET",
        url: "/api/v1/external/businesses/1/workflows"
      } satisfies InjectOptions;

      // Act
      const res = await app.inject(injectOptions);

      // Assert
      expect(res.statusCode).toEqual(404);

    });
  });

  describe("when no workflows are connected to the business", () => {
    it("should return an empty array", async () => {

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
      expect(res.statusCode).toEqual(200);
      expect(json).toEqual([]);
    });
  });

  describe("when the business has workflows connected to it", () => {
    it("should return an array of workflows belonging to the business of the given id", async () => {

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
      expect(res.statusCode).toEqual(200);
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

});
