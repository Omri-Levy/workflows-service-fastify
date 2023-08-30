import { cleanupDatabase, tearDownDatabase } from "@/test/helpers/database-helper";
import { EndUserService } from "@/end-user/end-user.service";
import { EndUserRepository } from "@/end-user/end-user.repository";
import { db } from "@/db/client";
import { build } from "@/server";
import { WorkflowRuntimeDataRepository } from "@/workflow/workflow-runtime-data.repository";
import { WorkflowDefinitionRepository } from "@/workflow/workflow-definition.repository";
import { InjectOptions } from "fastify";

describe("/api/v1/external/end-users #api #integration #external", () => {
  let app: Awaited<ReturnType<typeof build>>;
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


  describe("GET /", () => {

    it.skip("should return 401 for unauthorized requests", async () => {

      // Arrange
      const injectOptions = {
        method: "GET",
        url: "/api/v1/external/end-users"
      } satisfies InjectOptions;

      // Act
      const res = await app.inject(injectOptions);


      // Assert
      expect(res.statusCode).toBe(401);
    });

    it("should return an empty array if no end-users exist", async () => {

      // Arrange
      const injectOptions = {
        method: "GET",
        url: "/api/v1/external/end-users"
      } satisfies InjectOptions;

      // Act
      const res = await app.inject(injectOptions);
      const json = await res.json();

      // Assert
      expect(res.statusCode).toBe(200);
      expect(json).toEqual([]);
    });

    it("should return an array of end-users", async () => {

      // Arrange
      await endUserService.create({
        data: {
          firstName: "test",
          lastName: "lastName"
        }
      });
      await endUserService.create({
        data: {
          firstName: "test2",
          lastName: "lastName2"
        }
      });
      const injectOptions = {
        method: "GET",
        url: "/api/v1/external/end-users"
      } satisfies InjectOptions;

      // Act
      const res = await app.inject(injectOptions);
      const json = await res.json();

      // Assert
      expect(res.statusCode).toBe(200);
      expect(json).toEqual([
       expect.objectContaining({
          id: expect.any(String),
          firstName: "test",
          lastName: "lastName"
       }),
        expect.objectContaining({
          id: expect.any(String),
          firstName: "test2",
          lastName: "lastName2"
        }),
      ]);
    });
  });

  describe("GET /:id", () => {
    it.skip("should return 401 for unauthorized requests", async () => {

      // Arrange
      const injectOptions = {
        method: "GET",
        url: "/api/v1/external/end-users/1"
      } satisfies InjectOptions;

      // Act
      const res = await app.inject(injectOptions);


      // Assert
      expect(res.statusCode).toBe(401);
    });

    it("should return 404 for non-existent end-user", async () => {

      // Arrange
      const injectOptions = {
        method: "GET",
        url: "/api/v1/external/end-users/1"
      } satisfies InjectOptions;

      // Act
      const res = await app.inject(injectOptions);

      // Assert
      expect(res.statusCode).toBe(404);
    });

    it("should return an end-user", async () => {

      // Arrange
      const endUser = await endUserService.create({
        data: {
          firstName: "test",
          lastName: "lastName"
        }
      });
      const injectOptions = {
        method: "GET",
        url: `/api/v1/external/end-users/${endUser.id}`
      } satisfies InjectOptions;

      // Act
      const res = await app.inject(injectOptions);
      const json = await res.json();

      // Assert
      expect(res.statusCode).toBe(200);
      expect(json).toMatchObject({
        id: expect.any(String),
        firstName: "test",
        lastName: "lastName"
      });
    });
  });

  describe("GET /:endUserId/workflows", () => {
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

  describe("POST /", () => {
    it.skip("should return 401 for unauthorized requests", async () => {

      // Arrange
      const injectOptions = {
        method: "POST",
        url: "/api/v1/external/end-users",
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
        url: "/api/v1/external/end-users",
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
        url: "/api/v1/external/end-users",
        body: {
          firstName: false,
          lastName: {}
        }
      } satisfies InjectOptions;

      // Act
      const res = await app.inject(injectOptions);

      // Assert
      expect(res.statusCode).toBe(400);
    });

    it("creates an end-user", async () => {

      // Arrange
      const injectOptions = {
        method: "POST",
        url: "/api/v1/external/end-users",
        body: {
          firstName: "test",
          lastName: "lastName"
        }
      } satisfies InjectOptions;

      // Act
      const res = await app.inject(injectOptions);
      const json = await res.json();
      const endUser = await endUserService.getById(json.id);

      // Assert
      expect(res.statusCode).toBe(201);
      expect(json).toMatchObject({
        id: expect.any(String),
        firstName: "test",
        lastName: "lastName",
      });
      expect(endUser).toMatchObject({
        id: expect.any(String),
        firstName: "test",
        lastName: "lastName"
      });
    });

    // Currently `correlationId` is not passed at `create`, and `update` is not exposed
    it.skip("should return 400 for duplicate `correlationId`", async () => {

      // Arrange
      const injectOptions = {
        method: "POST",
        url: "/api/v1/external/end-users",
        body: {
          firstName: "test",
          lastName: "lastName",
          correlationId: "test"
        }
      } satisfies InjectOptions;
      const duplicateCorrelationIdInjectOptions = {
        method: "POST",
        url: "/api/v1/external/end-users",
        body: {
          firstName: "test2",
          lastName: "lastName2",
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
