import { build } from "@/server";
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

  it.skip("should return 401 for unauthorized requests", async () => {

    // Arrange
    const injectOptions = {
      method: "GET",
      url: "/api/v1/external/end-users/1/workflows"
    } satisfies InjectOptions;

    // Act
    const res = await app.inject(injectOptions);

    // Assert
    expect(res.statusCode).toBe(401);
  });

  it.skip("should return 404 for non-existent end-user", async () => {

    // Arrange
    const injectOptions = {
      method: "GET",
      url: "/api/v1/external/end-users/1/workflows"
    } satisfies InjectOptions;

    // Act
    const res = await app.inject(injectOptions);

    // Assert
    expect(res.statusCode).toBe(404);
  });

  it("should return an empty array if no workflows are connected to the end-user", async () => {

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

  it("should return an array of workflows connected to the end-user", async () => {

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
