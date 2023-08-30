import packageJson from "../../package.json";
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
import { WorkflowEventEmitterService } from "@/workflow/workflow-event-emitter.service";
import EventEmitter from "events";
import { HttpService } from "@/http/http.service";
import { DocumentChangedWebhookCaller } from "@/events/document-changed-webhook-caller";
import { WorkflowStateChangedWebhookCaller } from "@/events/workflow-state-changed-webhook-caller";
import { WorkflowCompletedWebhookCaller } from "@/events/workflow-completed-webhook-caller";
import { TWebhookConfig } from "@/events/types";
import { InjectOptions } from "fastify";
import { randomUUID } from "node:crypto";
import nock from "nock";

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
  const eventEmitter = new EventEmitter();
  const workflowEventEmitter = new WorkflowEventEmitterService(eventEmitter);
  const httpService = new HttpService();
  const config = {
    NODE_ENV: "test",
    WEBHOOK_URL: "http://webhook.test",
    WEBHOOK_SECRET: "test"
  } satisfies TWebhookConfig;
  const documentChangedWebhookCaller = new DocumentChangedWebhookCaller(
    httpService,
    workflowEventEmitter,
    config
  );
  const workflowStateChangedWebhookCaller = new WorkflowStateChangedWebhookCaller(
    httpService,
    workflowEventEmitter,
    config
  );
  const workflowCompletedWebhookCaller = new WorkflowCompletedWebhookCaller(
    httpService,
    workflowEventEmitter,
    config
  );
  const workflowService = new WorkflowService(
    workflowDefinitionRepository,
    workflowRuntimeDataRepository,
    endUserRepository,
    businessRepository,
    storageService,
    fileService,
    workflowEventEmitter,
    documentChangedWebhookCaller,
    workflowStateChangedWebhookCaller,
    workflowCompletedWebhookCaller
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
        const injectOptions = {
          method: "GET",
          url: "/api/v1/external/workflows"
        } satisfies InjectOptions;

        // Act
        const res = await app.inject(injectOptions);


        // Assert
        expect(res.statusCode).toEqual(401);
      });
    });

    describe("when no workflows exist", () => {
      it("should return 0 pages, 0 total, and an empty results array", async () => {

        // Arrange
        const injectOptions = {
          method: "GET",
          url: "/api/v1/external/workflows"
        } satisfies InjectOptions;

        // Act
        const res = await app.inject(injectOptions);

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
        const injectOptions = {
          method: "GET",
          url: "/api/v1/external/workflows"
        } satisfies InjectOptions;

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
        const res = await app.inject(injectOptions);
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
        const injectOptions = {
          method: "GET",
          url: "/api/v1/external/workflows/workflow-definition/1"
        } satisfies InjectOptions;

        // Act
        const res = await app.inject(injectOptions);


        // Assert
        expect(res.statusCode).toEqual(401);
      });
    });

    describe("when the workflow definition does not exist", () => {
      it("should return 404", async () => {

        // Arrange
        const injectOptions = {
          method: "GET",
          url: "/api/v1/external/workflows/workflow-definition/1"
        } satisfies InjectOptions;

        // Act
        const res = await app.inject(injectOptions);

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
        const injectOptions = {
          method: "GET",
          url: `/api/v1/external/workflows/workflow-definition/${workflow?.id}`
        } satisfies InjectOptions;

        // Act
        const res = await app.inject(injectOptions);
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
        const injectOptions = {
          method: "GET",
          url: "/api/v1/external/workflows/1"
        } satisfies InjectOptions;

        // Act
        const res = await app.inject(injectOptions);


        // Assert
        expect(res.statusCode).toEqual(401);
      });
    });

    describe("when the workflow does not exist", () => {
      it("should return 404", async () => {

        // Arrange
        const injectOptions = {
          method: "GET",
          url: "/api/v1/external/workflows/1"
        } satisfies InjectOptions;

        // Act
        const res = await app.inject(injectOptions);

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
        const injectOptions = {
          method: "GET",
          url: `/api/v1/external/workflows/${workflow[0]?.workflowRuntimeData?.id}`
        } satisfies InjectOptions;

        // Act
        const res = await app.inject(injectOptions);
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
        const injectOptions = {
          method: "PATCH",
          url: "/api/v1/external/workflows/1",
          body: {}
        } satisfies InjectOptions;

        // Act
        const res = await app.inject(injectOptions);

        // Assert
        expect(res.statusCode).toEqual(401);
      });
    });

    describe("when the workflow does not exist", () => {
      it("should return 404", async () => {

        // Arrange
        const injectOptions = {
          method: "PATCH",
          url: `/api/v1/external/workflows/1`,
          body: {}
        } satisfies InjectOptions;

        // Act
        const res = await app.inject(injectOptions);


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
        const injectOptions = {
          method: "PATCH",
          url: `/api/v1/external/workflows/${workflow?.[0].workflowRuntimeData?.id}`,
          body: {
            state: 123,
            status: true,
            context: []
          }
        } satisfies InjectOptions;

        // Act
        const res = await app.inject(injectOptions);

        // Assert
        expect(res.statusCode).toEqual(400);
      });
    });

    describe("when fields are valid", () => {
      it("should update the workflow", async () => {

        // Arrange
        const endUser = await endUserService.create({
          data: {
            firstName: "John",
            lastName: "Doe"
          }
        });
        const workflowDefinition = await workflowService.createWorkflowDefinition({
          name: "test",
          definitionType: "statechart-json",
          definition: {}
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
        const injectOptions = {
          method: "PATCH",
          url: `/api/v1/external/workflows/${workflow?.[0].workflowRuntimeData?.id}`,
          body: {
            state: "test",
            context: {
              entity: {
                data: {
                  firstName: "Bob",
                  lastName: "Doe"
                }
              }
            }
          }
        } satisfies InjectOptions;

        // Act
        const res = await app.inject(injectOptions);
        const json = await res.json();

        // Assert
        expect(res.statusCode).toEqual(200);
        expect(json).toMatchObject({
          state: "test",
          context: expect.objectContaining({
            entity: expect.objectContaining({
              data: {
                firstName: "Bob",
                lastName: "Doe"
              }
            })
          })
        });
      });

      it("should send a webhook for `workflow.context.document.changed` event", async () => {

        // Arrange
        const endUser = await endUserService.create({
          data: {
            firstName: "John",
            lastName: "Doe"
          }
        });
        const workflowDefinition = await workflowService.createWorkflowDefinition({
          name: "test",
          definitionType: "statechart-json",
          definition: {}
        });
        const workflow = await workflowService.createOrUpdateWorkflowRuntime({
          workflowDefinitionId: workflowDefinition.id,
          config: {
            subscriptions: [
              {
                type: "webhook",
                url: config.WEBHOOK_URL,
                events: ["workflow.context.document.changed"]
              }
            ]
          },
          context: {
            entity: {
              id: endUser.id,
              type: "individual",
              data: {
                firstName: "John",
                lastName: "Doe"
              }
            },
            documents: [
              {
                type: "water_bill",
                pages: [
                  {
                    uri: "https://www.gstatic.com/webp/gallery3/1.sm.png",
                    type: "png",
                    metadata: {
                      side: "front",
                      pageNumber: "1"
                    },
                    provider: "http"
                  }
                ],
                issuer: {
                  country: "GH"
                },
                version: 1,
                category: "proof_of_address",
                properties: {
                  docNumber: "1234",
                  userAddress: "Turkey, buhgdawe"
                },
                issuingVersion: 1
              }
            ]
          }
        });
        const id = randomUUID();
        const entityId = workflow?.[0]?.workflowRuntimeData?.businessId || workflow?.[0]?.workflowRuntimeData?.endUserId;
        const nockResponse = {
          id: expect.any(String),
          eventName: "workflow.context.document.changed",
          apiVersion: packageJson.version,
          timestamp: expect.any(String),
          workflowCreatedAt: workflow?.[0]?.workflowRuntimeData?.createdAt?.toISOString(),
          workflowResolvedAt: workflow?.[0]?.workflowRuntimeData?.resolvedAt,
          workflowDefinitionId: workflow?.[0]?.workflowRuntimeData?.workflowDefinitionId,
          workflowRuntimeId: workflow?.[0]?.workflowRuntimeData?.id,
          ballerineEntityId: entityId,
          correlationId: endUser.id,
          environment: config.NODE_ENV,
          data: {
            entity: {
              data: {
                firstName: "Bob",
                lastName: "Doe"
              }
            },
            documents: [
              {
                id,
                type: "water_bill",
                pages: [
                  {
                    uri: "https://www.gstatic.com/webp/gallery3/1.sm.png",
                    type: "png",
                    metadata: {
                      side: "front",
                      pageNumber: "1"
                    },
                    provider: "http"
                  }
                ],
                issuer: {
                  country: "GH"
                },
                version: 1,
                category: "proof_of_address",
                decision: {
                  status: "approved"
                },
                properties: {
                  docNumber: "1234",
                  userAddress: "Turkey, buhgdawe"
                },
                issuingVersion: 1
              }
            ]
          }
        };
        const injectOptions = {
          method: "PATCH",
          url: `/api/v1/external/workflows/${workflow?.[0].workflowRuntimeData?.id}`,
          body: {
            state: "test",
            context: {
              entity: {
                data: {
                  firstName: "Bob",
                  lastName: "Doe"
                }
              },
              documents: [
                {
                  id,
                  type: "water_bill",
                  pages: [
                    {
                      uri: "https://www.gstatic.com/webp/gallery3/1.sm.png",
                      type: "png",
                      metadata: {
                        side: "front",
                        pageNumber: "1"
                      },
                      provider: "http",
                      ballerineFileId: "cllvb8e380006ijin3ml4r249"
                    }
                  ],
                  issuer: {
                    country: "GH"
                  },
                  version: 1,
                  category: "proof_of_address",
                  decision: {
                    status: "approved"
                  },
                  properties: {
                    docNumber: "1234",
                    userAddress: "Turkey, buhgdawe"
                  },
                  issuingVersion: 1
                }
              ]
            }
          }
        } satisfies InjectOptions;
        let webhookResponse;
        nock(config.WEBHOOK_URL)
          .post("/", (body) => {
            webhookResponse = body;

            return true;
          })
          .reply(200);

        // Act
        await app.inject(injectOptions);

        // Assert
        expect(webhookResponse).toMatchObject(nockResponse);

        nock.cleanAll();
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
        const injectOptions = {
          method: "POST",
          url: "/api/v1/external/workflows/intent",
          body: {}
        } satisfies InjectOptions;

        // Act
        const res = await app.inject(injectOptions);


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
        const injectOptions = {
          method: "POST",
          url: "/api/v1/external/workflows/intent",
          body: {
            entityId: endUser.id,
            intentName: "test"
          }
        } satisfies InjectOptions;

        // Act
        const res = await app.inject(injectOptions);

        // Assert
        expect(res.statusCode).toEqual(404);
      });
    });

    describe("when no entity matches the provided `entityId`", () => {
      it("should return 404", async () => {

        // Arrange
        const injectOptions = {
          method: "POST",
          url: "/api/v1/external/workflows/intent",
          body: {
            entityId: "1",
            intentName: "kycSignup"
          }
        } satisfies InjectOptions;


        // Act
        const res = await app.inject(injectOptions);

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
        const injectOptions = {
          method: "POST",
          url: "/api/v1/external/workflows/intent",
          body: {
            entityId: endUser.id,
            intentName: "kycSignup"
          }
        } satisfies InjectOptions;

        // Act
        const res = await app.inject(injectOptions);

        // Assert
        expect(res.statusCode).toEqual(201);
      });
    });
  });

  describe("POST /run", () => {
    describe("when unauthenticated", () => {
      it("should return 401", async () => {

        // Arrange
        const injectOptions = {
          method: "POST",
          url: "/api/v1/external/workflows/run",
          body: {}
        } satisfies InjectOptions;

        // Act
        const res = await app.inject(injectOptions);


        // Assert
        expect(res.statusCode).toEqual(401);
      });
    });

    describe("when missing required fields", () => {
      it("should return 400", async () => {

        // Arrange
        const injectOptions = {
          method: "POST",
          url: "/api/v1/external/workflows/run",
          body: {}
        } satisfies InjectOptions;

        // Act
        const res = await app.inject(injectOptions);


        // Assert
        expect(res.statusCode).toEqual(400);
      });
    });

    describe("when fields are invalid", () => {
      it("should return 400", async () => {

        // Arrange
        const injectOptions = {
          method: "POST",
          url: "/api/v1/external/workflows/run",
          body: {
            workflowId: 123,
            context: [],
            config: true
          }
        } satisfies InjectOptions;

        // Act
        const res = await app.inject(injectOptions);

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
        const injectOptions = {
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
        } satisfies InjectOptions;

        // Act
        const res = await app.inject(injectOptions);
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
        const injectOptions = {
          method: "POST",
          url: "/api/v1/external/workflows/run",
          body: {
            workflowId: workflowDefinition.id,
            context: {
              entity: {}
            },
            config: {}
          }
        } satisfies InjectOptions;

        // Act
        const res = await app.inject(injectOptions);

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
        const injectOptions = {
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
        } satisfies InjectOptions;

        // Act
        const res = await app.inject(injectOptions);
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
        const res1InjectOptions = {
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
        } satisfies InjectOptions;
        const res2InjectOptions = {
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
        } satisfies InjectOptions;

        // Act
        const res1 = await app.inject(res1InjectOptions);
        const res2 = await app.inject(res2InjectOptions);
        const json1 = await res1.json();
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
        const injectOptions = {
          method: "POST",
          url: "/api/v1/external/workflows/1/event",
          body: {}
        } satisfies InjectOptions;

        // Act
        const res = await app.inject(injectOptions);

        // Assert
        expect(res.statusCode).toEqual(401);
      });
    });

    describe("when the workflow does not exist", () => {
      it("should return 404", async () => {

        // Arrange
        const injectOptions = {
          method: "POST",
          url: "/api/v1/external/workflows/1/event",
          body: {
            name: "test"
          }
        } satisfies InjectOptions;

        // Act
        const res = await app.inject(injectOptions);

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
        const injectOptions = {
          method: "POST",
          url: `/api/v1/external/workflows/${workflow?.[0]?.workflowRuntimeData?.id}/event`,
          body: {}
        } satisfies InjectOptions;

        // Act
        const res = await app.inject(injectOptions);

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
        const injectOptions = {
          method: "POST",
          url: `/api/v1/external/workflows/${workflow?.[0]?.workflowRuntimeData?.id}/event`,
          body: {
            name: {}
          }
        } satisfies InjectOptions;

        // Act
        const res = await app.inject(injectOptions);

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
        const injectOptions = {
          method: "POST",
          url: `/api/v1/external/workflows/${workflow?.[0]?.workflowRuntimeData?.id}/event`,
          body: {
            name: "test"
          }
        } satisfies InjectOptions;

        // Act
        const res = await app.inject(injectOptions);

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
        const injectOptions = {
          method: "POST",
          url: `/api/v1/external/workflows/${workflow?.[0]?.workflowRuntimeData?.id}/event`,
          body: {
            name: "approve"
          }
        } satisfies InjectOptions;

        // Act
        const res = await app.inject(injectOptions);

        // Assert
        expect(res.statusCode).toEqual(400);

      });
    });

    describe("when `event` is in `nextEvents`", () => {
      it("should update the workflow's state", async () => {

        // Arrange
        const endUser = await endUserService.create({
          data: {
            firstName: "John",
            lastName: "Doe"
          }
        });
        const workflowDefinition = await workflowService.createWorkflowDefinition({
          name: "test",
          definitionType: "statechart-json",
          definition: {
            initial: "idle",
            states: {
              idle: {
                on: {
                  approve: "approved"
                }
              },
              approved: {
                type: "final"
              }
            }
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
          }
        });
        const injectOptions = {
          method: "POST",
          url: `/api/v1/external/workflows/${workflow?.[0]?.workflowRuntimeData?.id}/event`,
          body: {
            name: "approve"
          }
        } satisfies InjectOptions;

        // Act
        const res = await app.inject(injectOptions);
        const updatedWorkflow = await workflowService.getWorkflowRuntimeDataById(workflow?.[0]?.workflowRuntimeData?.id);

        // Assert
        expect(res.statusCode).toEqual(200);
        expect(updatedWorkflow?.state).toEqual("approved");

      });

      it("should send a webhook for `workflow.completed` event", async () => {

        // Arrange
        const endUser = await endUserService.create({
          data: {
            firstName: "John",
            lastName: "Doe"
          }
        });
        const workflowDefinition = await workflowService.createWorkflowDefinition({
          name: "test",
          definitionType: "statechart-json",
          definition: {
            initial: "idle",
            states: {
              idle: {
                on: {
                  approve: "approved"
                }
              },
              approved: {
                type: "final"
              }
            }
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
            documents: [
              {
                type: "water_bill",
                pages: [
                  {
                    uri: "https://www.gstatic.com/webp/gallery3/1.sm.png",
                    type: "png",
                    metadata: {
                      side: "front",
                      pageNumber: "1"
                    },
                    provider: "http"
                  }
                ],
                issuer: {
                  country: "GH"
                },
                version: 1,
                category: "proof_of_address",
                properties: {
                  docNumber: "1234",
                  userAddress: "Turkey, buhgdawe"
                },
                issuingVersion: 1
              }
            ]
          },
          config: {
            subscriptions: [
              {
                type: "webhook",
                url: config.WEBHOOK_URL,
                events: ["workflow.completed"]
              }
            ]
          }
        });

        const nockResponse = {
          id: expect.any(String),
          eventName: "workflow.completed",
          apiVersion: packageJson.version,
          timestamp: expect.any(String),
          workflowCreatedAt: workflow?.[0]?.workflowRuntimeData?.createdAt?.toISOString(),
          workflowResolvedAt: workflow?.[0]?.workflowRuntimeData?.resolvedAt,
          workflowDefinitionId: workflow?.[0]?.workflowRuntimeData?.workflowDefinitionId,
          workflowRuntimeId: workflow?.[0]?.workflowRuntimeData?.id,
          environment: config.NODE_ENV,
          data: {
            entity: {
              data: {
                firstName: "John",
                lastName: "Doe"
              }
            },
            documents: [
              {
                type: "water_bill",
                pages: [
                  {
                    uri: "https://www.gstatic.com/webp/gallery3/1.sm.png",
                    type: "png",
                    metadata: {
                      side: "front",
                      pageNumber: "1"
                    },
                    provider: "http"
                  }
                ],
                issuer: {
                  country: "GH"
                },
                version: 1,
                category: "proof_of_address",
                properties: {
                  docNumber: "1234",
                  userAddress: "Turkey, buhgdawe"
                },
                issuingVersion: 1
              }
            ]
          }
        };
        let webhookResponse;
        nock(config.WEBHOOK_URL)
          .post("/", (body) => {
            webhookResponse = body;
            return true;
          })
          .reply(200);
        const injectOptions = {
          method: "POST",
          url: `/api/v1/external/workflows/${workflow?.[0]?.workflowRuntimeData?.id}/event`,
          body: {
            name: "approve"
          }
        } satisfies InjectOptions;

        // Act
        const res = await app.inject(injectOptions);

        // Assert
        expect(res.statusCode).toEqual(200);
        expect(webhookResponse).toMatchObject(nockResponse);

        nock.cleanAll();

      });
    });
  });

  describe("POST /:id/send-event", () => {
    describe("when unauthenticated", () => {
      it.skip("should return 401", async () => {

        // Arrange
        const injectOptions = {
          method: "POST",
          url: "/api/v1/external/workflows/1/send-event",
          body: {}
        } satisfies InjectOptions;

        // Act
        const res = await app.inject(injectOptions);

        // Assert
        expect(res.statusCode).toEqual(401);
      });
    });

    describe("when the workflow does not exist", () => {
      it("should return 404", async () => {

        // Arrange
        const injectOptions = {
          method: "POST",
          url: "/api/v1/external/workflows/1/send-event",
          body: {
            name: "test"
          }
        } satisfies InjectOptions;

        // Act
        const res = await app.inject(injectOptions);

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
        const injectOptions = {
          method: "POST",
          url: `/api/v1/external/workflows/${workflow?.[0]?.workflowRuntimeData?.id}/send-event`,
          body: {}
        } satisfies InjectOptions;

        // Act
        const res = await app.inject(injectOptions);

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
        const injectOptions = {
          method: "POST",
          url: `/api/v1/external/workflows/${workflow?.[0]?.workflowRuntimeData?.id}/send-event`,
          body: {
            name: {}
          }
        } satisfies InjectOptions;

        // Act
        const res = await app.inject(injectOptions);

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
        const injectOptions = {
          method: "POST",
          url: `/api/v1/external/workflows/${workflow?.[0]?.workflowRuntimeData?.id}/send-event`,
          body: {
            name: "test"
          }
        } satisfies InjectOptions;

        // Act
        const res = await app.inject(injectOptions);

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
        const injectOptions = {
          method: "POST",
          url: `/api/v1/external/workflows/${workflow?.[0]?.workflowRuntimeData?.id}/send-event`,
          body: {
            name: "approve"
          }
        } satisfies InjectOptions;

        // Act
        const res = await app.inject(injectOptions);

        // Assert
        expect(res.statusCode).toEqual(400);
      });
    });

    describe("when `event` is in `nextEvents`", () => {
      it("should update the workflow's state", async () => {

        // Arrange
        const endUser = await endUserService.create({
          data: {
            firstName: "John",
            lastName: "Doe"
          }
        });
        const workflowDefinition = await workflowService.createWorkflowDefinition({
          name: "test",
          definitionType: "statechart-json",
          definition: {
            initial: "idle",
            states: {
              idle: {
                on: {
                  approve: "approved"
                }
              },
              approved: {
                type: "final"
              }
            }
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
          }
        });
        const injectOptions = {
          method: "POST",
          url: `/api/v1/external/workflows/${workflow?.[0]?.workflowRuntimeData?.id}/send-event`,
          body: {
            name: "approve"
          }
        } satisfies InjectOptions;

        // Act
        const res = await app.inject(injectOptions);
        const updatedWorkflow = await workflowService.getWorkflowRuntimeDataById(workflow?.[0]?.workflowRuntimeData?.id);

        // Assert
        expect(res.statusCode).toEqual(200);
        expect(updatedWorkflow?.state).toEqual("approved");

      });

      it("should send a webhook for `workflow.completed` event", async () => {

        // Arrange
        const endUser = await endUserService.create({
          data: {
            firstName: "John",
            lastName: "Doe"
          }
        });
        const workflowDefinition = await workflowService.createWorkflowDefinition({
          name: "test",
          definitionType: "statechart-json",
          definition: {
            initial: "idle",
            states: {
              idle: {
                on: {
                  approve: "approved"
                }
              },
              approved: {
                type: "final"
              }
            }
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
            documents: [
              {
                type: "water_bill",
                pages: [
                  {
                    uri: "https://www.gstatic.com/webp/gallery3/1.sm.png",
                    type: "png",
                    metadata: {
                      side: "front",
                      pageNumber: "1"
                    },
                    provider: "http"
                  }
                ],
                issuer: {
                  country: "GH"
                },
                version: 1,
                category: "proof_of_address",
                properties: {
                  docNumber: "1234",
                  userAddress: "Turkey, buhgdawe"
                },
                issuingVersion: 1
              }
            ]
          },
          config: {
            subscriptions: [
              {
                type: "webhook",
                url: config.WEBHOOK_URL,
                events: ["workflow.completed"]
              }
            ]
          }
        });
        const nockResponse = {
          id: expect.any(String),
          eventName: "workflow.completed",
          apiVersion: packageJson.version,
          timestamp: expect.any(String),
          workflowCreatedAt: workflow?.[0]?.workflowRuntimeData?.createdAt?.toISOString(),
          workflowResolvedAt: workflow?.[0]?.workflowRuntimeData?.resolvedAt,
          workflowDefinitionId: workflow?.[0]?.workflowRuntimeData?.workflowDefinitionId,
          workflowRuntimeId: workflow?.[0]?.workflowRuntimeData?.id,
          environment: config.NODE_ENV,
          data: {
            entity: {
              data: {
                firstName: "John",
                lastName: "Doe"
              }
            },
            documents: [
              {
                type: "water_bill",
                pages: [
                  {
                    uri: "https://www.gstatic.com/webp/gallery3/1.sm.png",
                    type: "png",
                    metadata: {
                      side: "front",
                      pageNumber: "1"
                    },
                    provider: "http"
                  }
                ],
                issuer: {
                  country: "GH"
                },
                version: 1,
                category: "proof_of_address",
                properties: {
                  docNumber: "1234",
                  userAddress: "Turkey, buhgdawe"
                },
                issuingVersion: 1
              }
            ]
          }
        };
        let webhookResponse;
        nock(config.WEBHOOK_URL)
          .post("/", (body) => {
            webhookResponse = body;

            return true;
          })
          .reply(200);
        const injectOptions = {
          method: "POST",
          url: `/api/v1/external/workflows/${workflow?.[0]?.workflowRuntimeData?.id}/send-event`,
          body: {
            name: "approve"
          }
        } satisfies InjectOptions;

        // Act
        const res = await app.inject(injectOptions);

        // Assert
        expect(res.statusCode).toEqual(200);
        expect(webhookResponse).toMatchObject(nockResponse);

        nock.cleanAll();

      });
    });

  });

  describe("GET /:id/context", () => {
    describe("when unauthenticated", () => {
      it.skip("should return 401", async () => {

        // Arrange
        const injectOptions = {
          method: "GET",
          url: "/api/v1/external/workflows/1/context"
        } satisfies InjectOptions;

        // Act
        const res = await app.inject(injectOptions);

        // Assert
        expect(res.statusCode).toEqual(401);
      });
    });

    describe("when the workflow does not exist", () => {
      it("should return 404", async () => {

        // Arrange
        const injectOptions = {
          method: "GET",
          url: "/api/v1/external/workflows/1/context"
        } satisfies InjectOptions;

        // Act
        const res = await app.inject(injectOptions);

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
        const injectOptions = {
          method: "GET",
          url: `/api/v1/external/workflows/${workflow?.[0]?.workflowRuntimeData?.id}/context`
        } satisfies InjectOptions;

        // Act
        const res = await app.inject(injectOptions);
        const json = await res.json();

        // Assert
        expect(res.statusCode).toEqual(200);
        expect(json).toEqual({
          context: workflow?.[0]?.workflowRuntimeData?.context
        });
      });
    });
  });
});