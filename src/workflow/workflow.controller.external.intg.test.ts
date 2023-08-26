import { build } from "@/server";
import { cleanupDatabase, tearDownDatabase } from "@/test/helpers/database-helper";
import { WorkflowService } from "@/workflow/workflow.service";
import { BusinessRepository } from "@/business/business.repository";
import { db } from "@/db/client";
import { WorkflowDefinitionRepository } from "@/workflow/workflow-definition.repository";
import { WorkflowRuntimeDataRepository } from "@/workflow/workflow-runtime-data.repository";
import { EndUserRepository } from "@/end-user/end-user.repository";
import { FileRepository } from "@/storage/storage.repository";
import { FileService } from "@/providers/file/file.service";
import { StorageService } from "@/storage/storage.service";
import { EndUserService } from "@/end-user/end-user.service";

describe("/api/v1/external/workflows #api #integration #external", () => {
  let app: Awaited<ReturnType<typeof build>>;
  const businessRepository = new BusinessRepository(
    db
  );
  const workflowDefinitionRepository = new WorkflowDefinitionRepository(db);
  const workflowRuntimeDataRepository = new WorkflowRuntimeDataRepository(db);
  const endUserRepository = new EndUserRepository(db);
  const endUserService = new EndUserService(endUserRepository);
  const fileRepository = new FileRepository(db);
  const fileService = new FileService();
  const storageService = new StorageService(fileRepository);
  const workflowService = new WorkflowService(
    workflowDefinitionRepository,
    workflowRuntimeDataRepository,
    endUserRepository,
    businessRepository,
    storageService,
    fileService
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
    describe("when unauthenticated", () => {
      it.skip("should return 401", async () => {
        // Arrange

        // Act
        const res = await app.inject({
          method: "GET",
          url: "/api/v1/external/workflows"
        });

        // Assert
        expect(res.statusCode).toEqual(401);
      });
    });

    describe("when no workflows exist", () => {
      it("should return 0 pages, 0 total, and an empty results array", async () => {
        // Arrange

        // Act
        const res = await app.inject({
          method: "GET",
          url: "/api/v1/external/workflows"
        });

        // Assert
        expect(res.statusCode).toEqual(200);
        expect(res.json()).toEqual({
          meta: {
            pages: 0,
            total: 0
          },
          results: []
        });
      });
    });

    describe("when workflows exist", () => {
      it("should return an array of workflows", async () => {
        // Arrange
        const endUser = await endUserService.create({
          data: {
            firstName: "John",
            lastName: "Doe"
          }
        });

        // Act
        const workflowDefinition = await workflowService.createWorkflowDefinition({
          name: "test",
          definitionType: "statechart-json",
          definition: {},
          backend: {},
          extensions: [],
          persistStates: [],
          submitStates: []
        });
        const workflow1 = await workflowService.createOrUpdateWorkflowRuntime({
          workflowDefinitionId: workflowDefinition.id,
          config: {},
          context: {
            entity: {
              id: endUser.id,
              type: "individual",
              data: {
                firstName: "John",
                lastName: "Doe"
              }
            },
            documents: []
          }
        });
        const workflow2 = await workflowService.createOrUpdateWorkflowRuntime({
          workflowDefinitionId: workflowDefinition.id,
          config: {},
          context: {
            entity: {
              id: endUser.id + "1",
              type: "individual",
              data: {
                firstName: "John",
                lastName: "Doe"
              }
            },
            documents: []
          }
        });
        const res = await app.inject({
          method: "GET",
          url: "/api/v1/external/workflows"
        });
        const json = await res.json();

        // Assert
        expect(res.statusCode).toEqual(200);
        expect(json).toEqual({
          meta: {
            pages: 0,
            total: 2
          },
          results: [
            {
              id: workflow1[0].workflowRuntimeData.id,
              workflowDefinitionId: workflowDefinition.id,
              workflowDefinitionName: workflowDefinition.name,
              status: "active",
              state: null,
              createdBy: "SYSTEM",
              context: {
                entity: {
                  id: endUser.id,
                  type: "individual",
                  data: {
                    firstName: "John",
                    lastName: "Doe"
                  }
                },
                documents: []
              },
              assignee: null,
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
              resolvedAt: null
            },
            {
              id: workflow2[0].workflowRuntimeData.id,
              workflowDefinitionId: workflowDefinition.id,
              workflowDefinitionName: workflowDefinition.name,
              status: "active",
              state: null,
              createdBy: "SYSTEM",
              context: {
                entity: {
                  id: endUser.id + "1",
                  type: "individual",
                  data: {
                    firstName: "John",
                    lastName: "Doe"
                  }
                },
                documents: []
              },
              assignee: null,
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
              resolvedAt: null
            }
          ]
        });
      });
    });

  });

  describe("GET /workflow-definition/:id", () => {
    describe("when unauthenticated", () => {
      it.skip("should return 401", async () => {
        // Arrange

        // Act
        const res = await app.inject({
          method: "GET",
          url: "/api/v1/external/workflows/workflow-definition/1"
        });

        // Assert
        expect(res.statusCode).toEqual(401);
      });
    });

    describe("when the workflow definition does not exist", () => {
      it("should return 404", async () => {
        // Arrange

        // Act
        const res = await app.inject({
          method: "GET",
          url: "/api/v1/external/workflows/workflow-definition/1"
        });

        // Assert
        expect(res.statusCode).toEqual(404);
      });
    });

    describe("when the workflow definition exists", () => {
      it("should return the workflow definition belonging to the id", async () => {
        // Arrange
        const workflow = await workflowService.createWorkflowDefinition({
          name: "test",
          definitionType: "statechart-json",
          definition: {}
        });

        // Act
        const res = await app.inject({
          method: "GET",
          url: `/api/v1/external/workflows/workflow-definition/${workflow?.id}`
        });
        const json = await res.json();

        // Assert
        expect(res.statusCode).toEqual(200);
        expect(json).toEqual(expect.objectContaining({
          id: workflow.id
        }));
      });
    });
  });

  describe("GET /:id", () => {
    describe("when unauthenticated", () => {
      it.skip("should return 401", async () => {
        // Arrange

        // Act
        const res = await app.inject({
          method: "GET",
          url: "/api/v1/external/workflows/1"
        });

        // Assert
        expect(res.statusCode).toEqual(401);
      });
    });

    describe("when the workflow does not exist", () => {
      it("should return 404", async () => {
        // Arrange

        // Act
        const res = await app.inject({
          method: "GET",
          url: "/api/v1/external/workflows/1"
        });

        // Assert
        expect(res.statusCode).toEqual(404);
      });
    });

    describe("when the workflow exists", () => {
      it("should return the workflow belonging to the id", async () => {
        // Arrange
        const workflowDefinition = await workflowService.createWorkflowDefinition({
          name: "test",
          definitionType: "statechart-json",
          definition: {}
        });
        const endUser = await endUserService.create({
          data: {
            firstName: "John",
            lastName: "Doe"
          }
        });
        const workflow = await workflowService.createOrUpdateWorkflowRuntime({
          workflowDefinitionId: workflowDefinition.id,
          context: {
            entity: {
              id: endUser.id,
              type: "individual",
              data: {
                firstName: "John",
                lastName: "Doe"
              }
            },
            documents: []
          },
          config: {}
        });

        // Act
        const res = await app.inject({
          method: "GET",
          url: `/api/v1/external/workflows/${workflow[0]?.workflowRuntimeData?.id}`
        });
        const json = await res.json();

        // Assert
        expect(res.statusCode).toEqual(200);
        expect(json).toEqual({
          workflowDefinition: expect.objectContaining({
            id: workflowDefinition.id
          }),
          workflowRuntimeData: expect.objectContaining({
            id: workflow[0]?.workflowRuntimeData?.id
          })
        });
      });
    });
  });

  describe("PATCH /:id", () => {
    describe("when unauthenticated", () => {
      it.skip("should return 401", async () => {
        // Arrange

        // Act
        const res = await app.inject({
          method: "PATCH",
          url: "/api/v1/external/workflows/1",
          body: {}
        });

        // Assert
        expect(res.statusCode).toEqual(401);
      });
    });

    describe("when the workflow does not exist", () => {
      it("should return 404", async () => {
        // Arrange

        // Act
        const res = await app.inject({
          method: "PATCH",
          url: `/api/v1/external/workflows/1`,
          body: {}
        });

        // Assert
        expect(res.statusCode).toEqual(404);
      });
    });

    describe("when fields are invalid", () => {
      it("should return 400", async () => {
        // Arrange
        const workflowDefinition = await workflowService.createWorkflowDefinition({
          name: "test",
          definitionType: "statechart-json",
          definition: {}
        });
        const endUser = await endUserService.create({
          data: {
            firstName: "John",
            lastName: "Doe"
          }
        });
        const workflow = await workflowService.createOrUpdateWorkflowRuntime({
          workflowDefinitionId: workflowDefinition.id,
          config: {},
          context: {
            entity: {
              id: endUser.id,
              type: "individual",
              data: {
                firstName: "John",
                lastName: "Doe"
              }
            },
            documents: []
          }
        });

        // Act
        const res = await app.inject({
          method: "PATCH",
          url: `/api/v1/external/workflows/${workflow?.[0].workflowRuntimeData?.id}`,
          body: {
            state: 123,
            status: true,
            context: []
          }
        });

        // Assert
        expect(res.statusCode).toEqual(400);
      });
    });

    describe("when partially updating `jsonb`", () => {
      it.skip("should merge the new data with the existing data", () => {
      });
    });
  });


  describe("POST /intent", () => {
    describe("when unauthenticated", () => {
      it.skip("should return 401", async () => {
        // Arrange

        // Act
        const res = await app.inject({
          method: "POST",
          url: "/api/v1/external/workflows/intent",
          body: {}
        });

        // Assert
        expect(res.statusCode).toEqual(401);
      });
    });

    describe("when no workflows match the provided `intentName`", () => {
      it("should return 404", async () => {
        // Arrange
        const endUser = await endUserService.create({
          data: {
            firstName: "John",
            lastName: "Doe"
          }
        });

        // Act
        const res = await app.inject({
          method: "POST",
          url: "/api/v1/external/workflows/intent",
          body: {
            entityId: endUser.id,
            intentName: "test"
          }
        });

        // Assert
        expect(res.statusCode).toEqual(404);
      });
    });

    describe("when no entity matches the provided `entityId`", () => {
      it("should return 404", async () => {
        // Arrange

        // Act
        const res = await app.inject({
          method: "POST",
          url: "/api/v1/external/workflows/intent",
          body: {
            entityId: "1",
            intentName: "kycSignup"
          }
        });

        // Assert
        expect(res.statusCode).toEqual(404);
      });
    });

    describe("when a match is found for both `intentName` and `entityId`", () => {
      it("should create a workflow", async () => {
        // Arrange
        await workflowService.createWorkflowDefinition({
          // @ts-expect-error - we don't expect id to be passed in application code.
          id: "COLLECT_DOCS_b0002zpeid7bq9aaa",
          name: "Collect Documents",
          definitionType: "statechart-json",
          definition: {}
        });
        const endUser = await endUserService.create({
          data: {
            firstName: "John",
            lastName: "Doe"
          }
        });

        // Act
        const res = await app.inject({
          method: "POST",
          url: "/api/v1/external/workflows/intent",
          body: {
            entityId: endUser.id,
            intentName: "kycSignup"
          }
        });

        // Assert
        expect(res.statusCode).toEqual(201);
      });
    });
  });

  describe("POST /run", () => {
    describe("when unauthenticated", () => {
      it.skip("should return 401", async () => {
        // Arrange

        // Act
        const res = await app.inject({
          method: "POST",
          url: "/api/v1/external/workflows/run",
          body: {}
        });

        // Assert
        expect(res.statusCode).toEqual(401);
      });
    });

    describe("when missing required fields", () => {
      it("should return 400", async () => {
        // Arrange

        // Act
        const res = await app.inject({
          method: "POST",
          url: "/api/v1/external/workflows/run",
          body: {}
        });

        // Assert
        expect(res.statusCode).toEqual(400);
      });
    });

    describe("when fields are invalid", () => {
      it("should return 400", async () => {
        // Arrange

        // Act
        const res = await app.inject({
          method: "POST",
          url: "/api/v1/external/workflows/run",
          body: {
            workflowId: 123,
            context: [],
            config: true
          }
        });

        // Assert
        expect(res.statusCode).toEqual(400);
      });
    });

    describe("when no id is found on `entity`", () => {
      it("should fallback to `ballerineEntityId", async () => {
        // Arrange
        const workflowDefinition = await workflowService.createWorkflowDefinition({
          name: "test",
          definitionType: "statechart-json",
          definition: {}
        });
        const endUser = await endUserService.create({
          data: {
            firstName: "John",
            lastName: "Doe"
          }
        });

        // Act
        const res = await app.inject({
          method: "POST",
          url: "/api/v1/external/workflows/run",
          body: {
            workflowId: workflowDefinition.id,
            context: {
              entity: {
                ballerineEntityId: endUser.id
              },
              documents: []
            },
            config: {}
          }
        });
        const json = await res.json();

        // Assert
        expect(res.statusCode).toEqual(200);
        expect(json).toEqual({
          workflowDefinitionId: workflowDefinition.id,
          workflowRuntimeId: expect.any(String),
          ballerineEntityId: endUser.id
        });
      });
    });

    describe("when both `id` and `ballerineEntityId` are not found on `entity`", () => {
      it("should return 400", async () => {
        // Arrange
        const workflowDefinition = await workflowService.createWorkflowDefinition({
          name: "test",
          definitionType: "statechart-json",
          definition: {}
        });

        // Act
        const res = await app.inject({
          method: "POST",
          url: "/api/v1/external/workflows/run",
          body: {
            workflowId: workflowDefinition.id,
            context: {
              entity: {}
            },
            config: {}
          }
        });

        // Assert
        expect(res.statusCode).toEqual(400);
      });
    });

    describe("when a workflow doesn't exist", () => {
      it("should create a workflow", async () => {
        // Arrange

        // Act
        const workflowsBefore = await workflowService.listRuntimeData({});

        // Assert
        expect(workflowsBefore?.results?.length).toEqual(0);

        // Arrange
        const workflowDefinition = await workflowService.createWorkflowDefinition({
          name: "test",
          definitionType: "statechart-json",
          definition: {}
        });
        const endUser = await endUserService.create({
          data: {
            firstName: "John",
            lastName: "Doe"
          }
        });

        // Act
        const res = await app.inject({
          method: "POST",
          url: "/api/v1/external/workflows/run",
          body: {
            workflowId: workflowDefinition.id,
            context: {
              entity: {
                id: endUser.id,
                type: "individual",
                data: {
                  firstName: "John",
                  lastName: "Doe"
                }
              },
              documents: []
            },
            config: {}
          }
        });
        const json = await res.json();
        const workflowsAfter = await workflowService.listRuntimeData({});

        // Assert
        expect(res.statusCode).toEqual(200);
        expect(json).toEqual({
          workflowDefinitionId: workflowDefinition.id,
          workflowRuntimeId: expect.any(String),
          ballerineEntityId: expect.any(String)
        });
        expect(workflowsAfter?.results?.length).toEqual(1);
      });
    });

    describe("when a workflow does exist", () => {
      it("should update the existing workflow", async () => {

        // Arrange
        const workflowDefinition = await workflowService.createWorkflowDefinition({
          name: "test",
          definitionType: "statechart-json",
          definition: {}
        });
        const endUser = await endUserService.create({
          data: {
            firstName: "John",
            lastName: "Doe"
          }
        });

        // Act
        const res1 = await app.inject({
          method: "POST",
          url: "/api/v1/external/workflows/run",
          body: {
            workflowId: workflowDefinition.id,
            context: {
              entity: {
                id: endUser.id,
                type: "individual",
                data: {
                  firstName: "John",
                  lastName: "Doe"
                }
              },
              documents: []
            },
            config: {}
          }
        });
        const json1 = await res1.json();
        const res2 = await app.inject({
          method: "POST",
          url: "/api/v1/external/workflows/run",
          body: {
            workflowId: workflowDefinition.id,
            context: {
              entity: {
                id: endUser.id,
                type: "individual",
                data: {
                  firstName: "Bob",
                  lastName: "Smith"
                }
              },
              documents: []
            },
            config: {}
          }
        });
        const json2 = await res2.json();
        const workflows = await workflowService.listRuntimeData({});

        // Assert
        expect(res2.statusCode).toEqual(200);
        expect(json2).toEqual(json1);
        expect(workflows?.results?.length).toEqual(1);
        expect(workflows?.results?.[0]?.context?.entity?.data).toEqual({
          firstName: "Bob",
          lastName: "Smith"
        });
      });
    });
  });

  describe("POST /:id/event", () => {
    describe("when unauthenticated", () => {
      it.skip("should return 401", async () => {
        // Arrange

        // Act
        const res = await app.inject({
          method: "POST",
          url: "/api/v1/external/workflows/1/event",
          body: {}
        });

        // Assert
        expect(res.statusCode).toEqual(401);
      });
    });

    describe("when the workflow does not exist", () => {
      it("should return 404", async () => {
        // Arrange

        // Act
        const res = await app.inject({
          method: "POST",
          url: "/api/v1/external/workflows/1/event",
          body: {
            name: "test"
          }
        });

        // Assert
        expect(res.statusCode).toEqual(404);
      });
    });

    describe("when missing required fields", () => {
      it("should return 400", async () => {
        // Arrange
        const workflowDefinition = await workflowService.createWorkflowDefinition({
          name: "test",
          definitionType: "statechart-json",
          definition: {}
        });
        const workflow = await workflowService.createOrUpdateWorkflowRuntime({
          workflowDefinitionId: workflowDefinition.id,
          context: {
            entity: {
              id: "1",
              type: "individual",
              data: {
                firstName: "John",
                lastName: "Doe"
              }
            },
            documents: []
          }
        });

        // Act
        const res = await app.inject({
          method: "POST",
          url: `/api/v1/external/workflows/${workflow?.[0]?.workflowRuntimeData?.id}/event`,
          body: {}
        });

        // Assert
        expect(res.statusCode).toEqual(400);
      });
    });

    describe("when fields are invalid", () => {
      it("should return 400", async () => {
        // Arrange
        const workflowDefinition = await workflowService.createWorkflowDefinition({
          name: "test",
          definitionType: "statechart-json",
          definition: {}
        });
        const workflow = await workflowService.createOrUpdateWorkflowRuntime({
          workflowDefinitionId: workflowDefinition.id,
          context: {
            entity: {
              id: "1",
              type: "individual",
              data: {
                firstName: "John",
                lastName: "Doe"
              }
            },
            documents: []
          }
        });

        // Act
        const res = await app.inject({
          method: "POST",
          url: `/api/v1/external/workflows/${workflow?.[0]?.workflowRuntimeData?.id}/event`,
          body: {
            name: {}
          }
        });

        // Assert
        expect(res.statusCode).toEqual(400);
      });
    });

    describe.skip("when `event` is not in the workflow definition", () => {
      it("should return 400", async () => {
        // Arrange
        const workflowDefinition = await workflowService.createWorkflowDefinition({
          name: "test",
          definitionType: "statechart-json",
          definition: {}
        });
        const workflow = await workflowService.createOrUpdateWorkflowRuntime({
          workflowDefinitionId: workflowDefinition.id,
          context: {
            entity: {
              id: "1",
              type: "individual",
              data: {
                firstName: "John",
                lastName: "Doe"
              }
            },
            documents: []
          }
        });

        // Act
        const res = await app.inject({
          method: "POST",
          url: `/api/v1/external/workflows/${workflow?.[0]?.workflowRuntimeData?.id}/event`,
          body: {
            name: "test"
          }
        });

        // Assert
        expect(res.statusCode).toEqual(400);
      });
    });

    describe.skip("when `event` is not in `nextEvents`", () => {
      it("should return 400", async () => {
        // Arrange
        const workflowDefinition = await workflowService.createWorkflowDefinition({
          name: "test",
          definitionType: "statechart-json",
          definition: {}
        });
        const workflow = await workflowService.createOrUpdateWorkflowRuntime({
          workflowDefinitionId: workflowDefinition.id,
          context: {
            entity: {
              id: "1",
              type: "individual",
              data: {
                firstName: "John",
                lastName: "Doe"
              }
            },
            documents: []
          }
        });

        // Act
        const res = await app.inject({
          method: "POST",
          url: `/api/v1/external/workflows/${workflow?.[0]?.workflowRuntimeData?.id}/event`,
          body: {
            name: "approve"
          }
        });

        // Assert
        expect(res.statusCode).toEqual(400);
      });
    });
  });

  describe("POST /:id/send-event", () => {
    describe("when unauthenticated", () => {
      it.skip("should return 401", async () => {
        // Arrange

        // Act
        const res = await app.inject({
          method: "POST",
          url: "/api/v1/external/workflows/1/send-event",
          body: {}
        });

        // Assert
        expect(res.statusCode).toEqual(401);
      });
    });

    describe("when the workflow does not exist", () => {
      it("should return 404", async () => {
        // Arrange

        // Act
        const res = await app.inject({
          method: "POST",
          url: "/api/v1/external/workflows/1/send-event",
          body: {
            name: "test"
          }
        });

        // Assert
        expect(res.statusCode).toEqual(404);
      });
    });

    describe("when missing required fields", () => {
      it("should return 400", async () => {
        // Arrange
        const workflowDefinition = await workflowService.createWorkflowDefinition({
          name: "test",
          definitionType: "statechart-json",
          definition: {}
        });
        const workflow = await workflowService.createOrUpdateWorkflowRuntime({
          workflowDefinitionId: workflowDefinition.id,
          context: {
            entity: {
              id: "1",
              type: "individual",
              data: {
                firstName: "John",
                lastName: "Doe"
              }
            },
            documents: []
          }
        });

        // Act
        const res = await app.inject({
          method: "POST",
          url: `/api/v1/external/workflows/${workflow?.[0]?.workflowRuntimeData?.id}/send-event`,
          body: {}
        });

        // Assert
        expect(res.statusCode).toEqual(400);
      });
    });

    describe("when fields are invalid", () => {
      it("should return 400", async () => {
        // Arrange
        const workflowDefinition = await workflowService.createWorkflowDefinition({
          name: "test",
          definitionType: "statechart-json",
          definition: {}
        });
        const workflow = await workflowService.createOrUpdateWorkflowRuntime({
          workflowDefinitionId: workflowDefinition.id,
          context: {
            entity: {
              id: "1",
              type: "individual",
              data: {
                firstName: "John",
                lastName: "Doe"
              }
            },
            documents: []
          }
        });

        // Act
        const res = await app.inject({
          method: "POST",
          url: `/api/v1/external/workflows/${workflow?.[0]?.workflowRuntimeData?.id}/send-event`,
          body: {
            name: {}
          }
        });

        // Assert
        expect(res.statusCode).toEqual(400);
      });
    });

    describe.skip("when `event` is not in the workflow definition", () => {
      it("should return 400", async () => {
        // Arrange
        const workflowDefinition = await workflowService.createWorkflowDefinition({
          name: "test",
          definitionType: "statechart-json",
          definition: {}
        });
        const workflow = await workflowService.createOrUpdateWorkflowRuntime({
          workflowDefinitionId: workflowDefinition.id,
          context: {
            entity: {
              id: "1",
              type: "individual",
              data: {
                firstName: "John",
                lastName: "Doe"
              }
            },
            documents: []
          }
        });

        // Act
        const res = await app.inject({
          method: "POST",
          url: `/api/v1/external/workflows/${workflow?.[0]?.workflowRuntimeData?.id}/send-event`,
          body: {
            name: "test"
          }
        });

        // Assert
        expect(res.statusCode).toEqual(400);
      });
    });

    describe.skip("when `event` is not in `nextEvents`", () => {
      it("should return 400", async () => {
        // Arrange
        const workflowDefinition = await workflowService.createWorkflowDefinition({
          name: "test",
          definitionType: "statechart-json",
          definition: {}
        });
        const workflow = await workflowService.createOrUpdateWorkflowRuntime({
          workflowDefinitionId: workflowDefinition.id,
          context: {
            entity: {
              id: "1",
              type: "individual",
              data: {
                firstName: "John",
                lastName: "Doe"
              }
            },
            documents: []
          }
        });

        // Act
        const res = await app.inject({
          method: "POST",
          url: `/api/v1/external/workflows/${workflow?.[0]?.workflowRuntimeData?.id}/send-event`,
          body: {
            name: "approve"
          }
        });

        // Assert
        expect(res.statusCode).toEqual(400);
      });
    });
  });

  describe("GET /:id/context", () => {
    describe("when unauthenticated", () => {
      it.skip("should return 401", async () => {
        // Arrange

        // Act
        const res = await app.inject({
          method: "GET",
          url: "/api/v1/external/workflows/1/context"
        });

        // Assert
        expect(res.statusCode).toEqual(401);
      });
    });

    describe("when the workflow does not exist", () => {
      it("should return 404", async () => {
        // Arrange

        // Act
        const res = await app.inject({
          method: "GET",
          url: "/api/v1/external/workflows/1/context"
        });

        // Assert
        expect(res.statusCode).toEqual(404);
      });
    });

    describe("when the workflow exists", () => {
      it("should return the context of the workflow belonging to the id", async () => {
        // Arrange
        const workflowDefinition = await workflowService.createWorkflowDefinition({
          name: "test",
          definitionType: "statechart-json",
          definition: {}
        });
        const workflow = await workflowService.createOrUpdateWorkflowRuntime({
          workflowDefinitionId: workflowDefinition.id,
          context: {
            entity: {
              id: "1",
              type: "individual",
              data: {
                firstName: "John",
                lastName: "Doe"
              }
            },
            documents: []
          }
        });

        // Act
        const res = await app.inject({
          method: "GET",
          url: `/api/v1/external/workflows/${workflow?.[0]?.workflowRuntimeData?.id}/context`
        });
        const json = await res.json();

        // Assert
        expect(res.statusCode).toEqual(200);
        expect(json).toEqual({
          context: workflow?.[0]?.workflowRuntimeData?.context,
        });
      });
    });
  });
});