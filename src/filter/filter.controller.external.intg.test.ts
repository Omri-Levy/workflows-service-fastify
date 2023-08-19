import { cleanupDatabase, tearDownDatabase } from "@/test/helpers/database-helper";
import { FilterService } from "@/filter/filter.service";
import { FilterRepository } from "@/filter/filter.repository";
import { db } from "@/db/client";
import { build } from "@/server";
import { WorkflowService } from "@/workflow/workflow.service";
import { WorkflowDefinitionRepository } from "@/workflow/workflow-definition.repository";
import { WorkflowRuntimeDataRepository } from "@/workflow/workflow-runtime-data.repository";
import { BusinessRepository } from "@/business/business.repository";
import { FileRepository } from "@/storage/storage.repository";
import { StorageService } from "@/storage/storage.service";
import { FileService } from "@/providers/file/file.service";
import { EndUserRepository } from "@/end-user/end-user.repository";

describe("/api/v1/external/filters #api #integration #external", () => {
  let app: Awaited<ReturnType<typeof build>>;
  const filterRepository = new FilterRepository(
    db
  );
  const filterService = new FilterService(
    filterRepository
  );

  beforeAll(async () => {
    app = await build();
  });
  beforeEach(cleanupDatabase);
  afterEach(tearDownDatabase);


  describe("GET /", () => {

    it.skip("should return 401 for unauthorized requests", async () => {
      // Arrange

      // Act
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/external/filters"
      });

      // Assert
      expect(res.statusCode).toBe(401);
    });

    it("should return an empty array if no filters exist", async () => {
      // Arrange

      // Act
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/external/filters"
      });
      const json = await res.json();

      // Assert
      expect(res.statusCode).toBe(200);
      expect(json).toEqual([]);
    });

    it("should return an array of filters", async () => {
      // Arrange
      await filterService.create({
        data: {
          name: "test1",
          entity: "business",
          query: {
            select: {
              firstName: true,
            },
            where: {
              lastName: "lastName"
            }
          }
        }
      });
      await filterService.create({
        data: {
          name: "test2",
          entity: "individual",
          query: {
            select: {
              lastName: true,
            },
            where: {
              firstName: "firstName2"
            }
          }
        }
      });

      // Act
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/external/filters"
      });
      const json = await res.json();

      // Assert
      expect(res.statusCode).toBe(200);
      expect(json).toEqual([
       expect.objectContaining({
          id: expect.any(String),
          name: "test1",
          entity: "business",
         query: {
            select: {
              firstName: true,
            },
            where: {
              lastName: "lastName"
            }
         }
       }),
        expect.objectContaining({
          id: expect.any(String),
          name: "test2",
          entity: "individual",
          query: {
            select: {
              lastName: true,
            },
            where: {
              firstName: "firstName2"
            }
          }
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
        url: "/api/v1/external/filters/1"
      });

      // Assert
      expect(res.statusCode).toBe(401);
    });

    it("should return 404 for non-existent filter", async () => {
      // Arrange

      // Act
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/external/filters/1"
      });

      // Assert
      expect(res.statusCode).toBe(404);
    });

    it("should return a filter", async () => {
      // Arrange
      const filter = await filterService.create({
        data: {
          name: "test3",
          entity: "business",
          query: {
            select: {
              firstName: true,
            },
            where: {
              lastName: "lastName"
            }
          }
        }
      });

      // Act
      const res = await app.inject({
        method: "GET",
        url: `/api/v1/external/filters/${filter.id}`
      });
      const json = await res.json();

      // Assert
      expect(res.statusCode).toBe(200);
      expect(json).toMatchObject({
        id: expect.any(String),
        name: "test3",
        entity: "business",
        query: {
          select: {
            firstName: true,
          },
          where: {
            lastName: "lastName"
          }
        }
      });
    });
  });

  describe("POST /", () => {

    it.skip("should return 401 for unauthorized requests", async () => {
      // Arrange

      // Act
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/external/filters",
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
        url: "/api/v1/external/filters",
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
        url: "/api/v1/external/filters",
        body: {
          name: false,
          entity: {},
          query: []
        }
      });

      // Assert
      expect(res.statusCode).toBe(400);
    });

    it("creates a filter", async () => {
      // Arrange

      // Act
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/external/filters",
        body: {
          name: "test4",
          entity: "business",
          query: {
            select: {
              firstName: true,
            },
            where: {
              lastName: "lastName"
            }
          }
        }
      });
      const json = await res.json();
      const filter = await filterService.getById(json.id);

      // Assert
      expect(res.statusCode).toBe(201);
      expect(json).toMatchObject({
        id: expect.any(String),
        name: "test4",
        entity: "business",
        query: {
          select: {
            firstName: true,
          },
          where: {
            lastName: "lastName"
          }
        }
      });
      expect(filter).toMatchObject({
        id: expect.any(String),
        name: "test4",
        entity: "business",
        query: {
          select: {
            firstName: true,
          },
          where: {
            lastName: "lastName"
          }
        }
      });
    });

    it.skip("does not throw when using the created filter", async () => {
      // Arrange

      // Act
      const filter = await filterService.create({
        data: {
          name: "test5",
          entity: "business",
          query: {
            select: {
              firstName: true,
            },
            where: {
              lastName: "lastName"
            }
          }
        }
      });
      const endUserRepository = new EndUserRepository(db);
      const workflowDefinitionRepository = new WorkflowDefinitionRepository(db);
      const workflowRuntimeDataRepository = new WorkflowRuntimeDataRepository(db);
      const businessRepository = new BusinessRepository(db);
      const fileRepository = new FileRepository(db);
      const storageService = new StorageService(fileRepository);
      const fileService = new FileService();
      const workflowService = new WorkflowService(
        workflowDefinitionRepository,
        workflowRuntimeDataRepository,
        endUserRepository,
        businessRepository,
        storageService,
        fileService
      );

      // Assert
      expect(workflowService.listWorkflowRuntimeDataWithRelations({
        args: filter.query as any,
        entityType: 'businesses',
        orderBy: 'createdAt:asc',
        page: {
          number: 1,
          size: 10
        },
        filters: {},
      }))

    });

    // Currently `correlationId` is not passed at `create`, and `update` is not exposed
    it.skip("should return 400 for duplicate `name`", async () => {
      // Arrange

      // Act
      await app.inject({
        method: "POST",
        url: "/api/v1/external/filters",
        body: {
          name: "test",
          entity: "business",
          query: {
            select: {
              firstName: true,
            },
            where: {
              lastName: "lastName"
            }
          }
        }
      });
      const duplicateNameRes = await app.inject({
        method: "POST",
        url: "/api/v1/external/filters",
        body: {
          name: "test",
          entity: "individual",
          query: {
            select: {
              lastName: true,
            },
            where: {
              firstName: "firstName2"
            }
          }
        }
      });
      const duplicateCorrelationIdJson = await duplicateNameRes.json();

      // Assert
      expect(duplicateNameRes.statusCode).toBe(400);
      expect(duplicateCorrelationIdJson.message).toBe("Name already in use");
    });
  });
});
