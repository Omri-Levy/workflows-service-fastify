import { build, TApp } from "@/server";
import { EndUserRepository } from "@/end-user/end-user.repository";
import { db } from "@/db/client";
import { EndUserService } from "@/end-user/end-user.service";
import { cleanupDatabase, tearDownDatabase } from "@/test/helpers/database-helper";
import { WorkflowRuntimeDataRepository } from "@/workflow/workflow-runtime-data.repository";
import { WorkflowDefinitionRepository } from "@/workflow/workflow-definition.repository";
import { InjectOptions } from "fastify";

describe("GET /api/v1/external/end-users/:endUserId/workflows #api #integration #external", () => {
  let app: TApp;
  const endUserRepository = new EndUserRepository(
    db
  );
  const endUserService = new EndUserService(
    endUserRepository
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
        url: "/api/v1/external/end-users/1/workflows"
      } satisfies InjectOptions;

      // Act
      const res = await app.inject(injectOptions);

      // Assert
      expect(res.statusCode).toEqual(401);

    });
  });

  describe.skip("when the end-user does not exist", () => {
    it("should return 404", async () => {

      // Arrange
      const injectOptions = {
        method: "GET",
        url: "/api/v1/external/end-users/1/workflows"
      } satisfies InjectOptions;

      // Act
      const res = await app.inject(injectOptions);

      // Assert
      expect(res.statusCode).toEqual(404);
    });
  });

  describe("when no workflows are connected to the end-user", () => {
    it("should return an empty array", async () => {

      // Arrange
      const endUser = await endUserService.create({
        data: {
          firstName: "test",
          lastName: "lastName"
        }
      });

      const injectOptions = {
        method: "GET",
        url: `/api/v1/external/end-users/${endUser.id}/workflows`
      } satisfies InjectOptions;

      // Act
      const res = await app.inject(injectOptions);
      const json = await res.json();

      // Assert
      expect(res.statusCode).toBe(200);
      expect(json).toEqual([]);

    });
  });

  describe("when the end-user has workflows connected to it", () => {
    it("should return an array of workflows belonging to the end-user of the given id", async () => {

      // Arrange
      const workflowRuntimeDataRepository = new WorkflowRuntimeDataRepository(
        db
      );
      const workflowDefinitionRepository = new WorkflowDefinitionRepository(db);
      const endUser = await endUserService.create({
        data: {
          firstName: "test",
          lastName: "lastName"
        }
      });

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
          endUser: {
            connect: {
              id: endUser.id
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
        url: `/api/v1/external/end-users/${endUser.id}/workflows`
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

});
