import { cleanupDatabase, tearDownDatabase } from "@/test/helpers/database-helper";
import { EndUserService } from "@/end-user/end-user.service";
import { EndUserRepository } from "@/end-user/end-user.repository";
import { db } from "@/db/client";
import { build } from "@/server";
import { WorkflowRuntimeDataRepository } from "@/workflow/workflow-runtime-data.repository";
import { WorkflowDefinitionRepository } from "@/workflow/workflow-definition.repository";

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

      // Act
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/external/end-users"
      });

      // Assert
      expect(res.statusCode).toBe(401);
    });

    it("should return an empty array if no end-users exist", async () => {
      // Arrange

      // Act
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/external/end-users"
      });
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

      // Act
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/external/end-users"
      });
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

      // Act
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/external/end-users/1"
      });

      // Assert
      expect(res.statusCode).toBe(401);
    });

    it("should return 404 for non-existent end-user", async () => {
      // Arrange

      // Act
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/external/end-users/1"
      });

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

      // Act
      const res = await app.inject({
        method: "GET",
        url: `/api/v1/external/end-users/${endUser.id}`
      });
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

      // Act
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/external/end-users/1/workflows"
      });

      // Assert
      expect(res.statusCode).toBe(401);
    });

    it.skip("should return 404 for non-existent end-user", async () => {
      // Arrange

      // Act
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/external/end-users/1/workflows"
      });

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

      // Act
      const res = await app.inject({
        method: "GET",
        url: `/api/v1/external/end-users/${endUser.id}/workflows`
      });
      const json = await res.json();

      // Assert
      expect(res.statusCode).toBe(200);
      expect(json).toEqual([]);
    });

    it("should return an array of workflows connected to the end-user", async () => {
      // Arrange
      const endUser = await endUserService.create({
        data: {
          firstName: "test",
          lastName: "lastName"
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

      // Act
      const res = await app.inject({
        method: "GET",
        url: `/api/v1/external/end-users/${endUser.id}/workflows`
      });
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

      // Act
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/external/end-users",
        body: {}
      });

      // Assert
      expect(res.statusCode).toBe(401);
    });

    it("should return 400 for missing required fields", async () => {
      // Arrange

      // Act
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/external/end-users",
        body: {}
      });

      // Assert
      expect(res.statusCode).toBe(400);
    });

    it("should return 400 for invalid fields", async () => {
      // Arrange

      // Act
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/external/end-users",
        body: {
          firstName: false,
          lastName: {}
        }
      });

      // Assert
      expect(res.statusCode).toBe(400);
    });

    it("creates an end-user", async () => {
      // Arrange

      // Act
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/external/end-users",
        body: {
          firstName: "test",
          lastName: "lastName"
        }
      });
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

      // Act
      await app.inject({
        method: "POST",
        url: "/api/v1/external/end-users",
        body: {
          firstName: "test",
          lastName: "lastName",
          correlationId: "test"
        }
      });
      const duplicateCorrelationIdRes = await app.inject({
        method: "POST",
        url: "/api/v1/external/end-users",
        body: {
          firstName: "test2",
          lastName: "lastName2",
          correlationId: "test"
        }
      });
      const duplicateCorrelationIdJson = await duplicateCorrelationIdRes.json();

      // Assert
      expect(duplicateCorrelationIdRes.statusCode).toBe(400);
      expect(duplicateCorrelationIdJson.message).toBe("Correlation id already in use");
    });
  });
});
