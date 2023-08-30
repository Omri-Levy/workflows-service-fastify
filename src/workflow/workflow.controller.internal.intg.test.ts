import qs from "qs";
import { build } from "@/server";
import { cleanupDatabase, tearDownDatabase } from "@/test/helpers/database-helper";
import { BusinessRepository } from "@/business/business.repository";
import { WorkflowDefinitionRepository } from "@/workflow/workflow-definition.repository";
import { WorkflowRuntimeDataRepository } from "@/workflow/workflow-runtime-data.repository";
import { EndUserRepository } from "@/end-user/end-user.repository";
import { FileRepository } from "@/storage/storage.repository";
import { FileService } from "@/providers/file/file.service";
import { StorageService } from "@/storage/storage.service";
import { WorkflowService } from "@/workflow/workflow.service";
import { EndUserService } from "@/end-user/end-user.service";
import { FilterService } from "@/filter/filter.service";
import { FilterRepository } from "@/filter/filter.repository";
import { UserService } from "@/user/user.service";
import { UserRepository } from "@/user/user.repository";
import { PasswordService } from "@/auth/password/password.service";
import { db } from "@/db/client";
import { WorkflowEventEmitterService } from "@/workflow/workflow-event-emitter.service";
import EventEmitter from "events";
import { HttpService } from "@/http/http.service";
import { DocumentChangedWebhookCaller } from "@/events/document-changed-webhook-caller";
import { WorkflowStateChangedWebhookCaller } from "@/events/workflow-state-changed-webhook-caller";
import { WorkflowCompletedWebhookCaller } from "@/events/workflow-completed-webhook-caller";
import { TWebhookConfig } from "@/events/types";
import packageJson from "../../package.json";
import nock from "nock";
import { InjectOptions } from "fastify";

describe("/api/v1/internal/workflows #api #integration #internal", () => {
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
  const filterRepository = new FilterRepository(db);
  const filterService = new FilterService(filterRepository);
  const passwordService = new PasswordService();
  const userRepository = new UserRepository(db, passwordService);
  const userService = new UserService(userRepository);

  beforeAll(async () => {
    app = await build();
  });
  beforeEach(async () => {
    await cleanupDatabase(db);
    await userService.create({
      data: {
        email: "login@test.com",
        password: "password",
        firstName: "John",
        lastName: "Doe",
        roles: ["user"]
      }
    });
  });
  afterAll(async () => {
    await tearDownDatabase(db);
  });

  describe("POST /", () => {
    describe("when unauthenticated", () => {
      it("should return 401", async () => {

        // Arrange
        const injectOptions = {
          method: "POST",
          url: "/api/v1/internal/workflows",
          body: {
            name: "name",
            reviewMachineId: "reviewMachineId",
            definitionType: "statechart-json",
            definition: {},
            extensions: [],
            backend: {},
            persistStates: [],
            submitStates: []
          }
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
        const loginInjectOptions = {
          method: "POST",
          url: "/api/v1/internal/auth/login",
          body: {
            email: "login@test.com",
            password: "password"
          }
        } satisfies InjectOptions;
        const injectOptions = {
          method: "POST",
          url: "/api/v1/internal/workflows",
          body: {}
        } satisfies InjectOptions;

        // Act
        const loginRes = await app.inject(loginInjectOptions);
        await app.inject({
          ...injectOptions,
          headers: {
            Cookie: loginRes.headers['set-cookie']
          }
        });
        const res = await app.inject(injectOptions);


        // Assert
        expect(res.statusCode).toEqual(400);
      });
    });

    describe("when fields are invalid", () => {
      it("should return 400", async () => {

        // Arrange
        const loginInjectOptions = {
          method: "POST",
          url: "/api/v1/internal/auth/login",
          body: {
            email: "login@test.com",
            password: "password"
          }
        } satisfies InjectOptions;
        const injectOptions = {
          method: "POST",
          url: "/api/v1/internal/workflows",
          body: {
            name: {},
            reviewMachineId: [],
            definitionType: {},
            definition: {},
            extensions: [],
            backend: 123,
            persistStates: true,
            submitStates: false
          }
        } satisfies InjectOptions;

        // Act
        const loginRes = await app.inject(loginInjectOptions);
        const res = await app.inject({
          ...injectOptions,
          headers: {
            Cookie: loginRes.headers['set-cookie']
          }
        });

        // Assert
        expect(res.statusCode).toEqual(400);
      });
    });

    describe("when fields are valid", () => {
      it("should return 201", async () => {

        // Arrange
        const loginInjectOptions = {
          method: "POST",
          url: "/api/v1/internal/auth/login",
          body: {
            email: "login@test.com",
            password: "password"
          }
        } satisfies InjectOptions;
        const injectOptions = {
          method: "POST",
          url: "/api/v1/internal/workflows",
          body: {
            name: "name",
            reviewMachineId: "reviewMachineId",
            definitionType: "statechart-json",
            definition: {},
            extensions: [],
            backend: {},
            persistStates: [],
            submitStates: []
          }
        } satisfies InjectOptions;

        // Act
        const loginRes = await app.inject(loginInjectOptions);
        const res = await app.inject({
          ...injectOptions,
          headers: {
            Cookie: loginRes.headers['set-cookie']
          }
        });
        const json = await res.json();

        // Assert
        expect(res.statusCode).toEqual(201);
        expect(json).toEqual({
          id: expect.any(String),
          name: "name",
          definitionType: "statechart-json",
          definition: {},
          extensions: [],
          backend: {},
          persistStates: [],
          submitStates: [],
          version: 1
        });
      });
    });

  });

  describe("POST /:id/event", () => {
    describe("when unauthenticated", () => {
      it("should return 401", async () => {

        // Arrange
        const injectOptions = {
          method: "POST",
          url: "/api/v1/internal/workflows/1/event",
          body: {
            name: "test",
          }
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
        const loginInjectOptions = {
          method: "POST",
          url: "/api/v1/internal/auth/login",
          body: {
            email: "login@test.com",
            password: "password"
          }
        } satisfies InjectOptions;
        const injectOptions = {
          method: "POST",
          url: `/api/v1/internal/workflows/1/event`,
          body: {
            name: "test"
          }
        } satisfies InjectOptions;

        // Act
        const loginRes = await app.inject(loginInjectOptions);
        const res = await app.inject({
          ...injectOptions,
          headers: {
            Cookie: loginRes.headers['set-cookie']
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
          name: "name",
          definitionType: "statechart-json",
          definition: {}
        });
        const workflow = await workflowService.createOrUpdateWorkflowRuntime({
          workflowDefinitionId: workflowDefinition?.id,
          context: {
            entity: {
              id: "8",
              type: "individual",
              data: {
                firstName: "John",
                lastName: "Doe"
              }
            },
            documents: []
          }
        });
        const loginInjectOptions = {
          method: "POST",
          url: "/api/v1/internal/auth/login",
          body: {
            email: "login@test.com",
            password: "password"
          }
        } satisfies InjectOptions;
        const injectOptions = {
          method: "POST",
          url: `/api/v1/internal/workflows/${workflow?.[0]?.workflowRuntimeData?.id}/event`,
          body: {}
        } satisfies InjectOptions;

        // Act
        const loginRes = await app.inject(loginInjectOptions);
        const res = await app.inject({
          ...injectOptions,
          headers: {
            Cookie: loginRes.headers['set-cookie']
          }
        });

        // Assert
        expect(res.statusCode).toEqual(400);
      });
    });

    describe("when fields are invalid", () => {
      it("should return 400", async () => {

        // Arrange
        const workflowDefinition = await workflowService.createWorkflowDefinition({
          name: "name",
          definitionType: "statechart-json",
          definition: {}
        });
        const workflow = await workflowService.createOrUpdateWorkflowRuntime({
          workflowDefinitionId: workflowDefinition?.id,
          context: {
            entity: {
              id: "8",
              type: "individual",
              data: {
                firstName: "John",
                lastName: "Doe"
              }
            },
            documents: []
          }
        });
        const loginInjectOptions = {
          method: "POST",
          url: "/api/v1/internal/auth/login",
          body: {
            email: "login@test.com",
            password: "password"
          }
        } satisfies InjectOptions;
        const injectOptions = {
          method: "POST",
          url: `/api/v1/internal/workflows/${workflow?.[0]?.workflowRuntimeData?.id}/event`,
          body: {
            name: false,
            document: [],
            resubmissionReason: {}
          }
        } satisfies InjectOptions;

        // Act
        const loginRes = await app.inject(loginInjectOptions);
        const res = await app.inject({
          ...injectOptions,
          headers: {
            Cookie: loginRes.headers['set-cookie']
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
          name: "name",
          definitionType: "statechart-json",
          definition: {}
        });
        const workflow = await workflowService.createOrUpdateWorkflowRuntime({
          workflowDefinitionId: workflowDefinition?.id,
          context: {
            entity: {
              id: "9",
              type: "individual",
              data: {
                firstName: "John",
                lastName: "Doe"
              }
            },
            documents: []
          }
        });
        const loginInjectOptions = {
          method: "POST",
          url: "/api/v1/internal/auth/login",
          body: {
            email: "login@test.com",
            password: "password"
          }
        } satisfies InjectOptions;
        const injectOptions = {
          method: "POST",
          url: `/api/v1/internal/workflows/${workflow?.[0]?.workflowRuntimeData?.id}/event`,
          body: {
            name: "review"
          }
        } satisfies InjectOptions;

        // Act
        const loginRes = await app.inject(loginInjectOptions);
        const res = await app.inject({
          ...injectOptions,
          headers: {
            Cookie: loginRes.headers['set-cookie']
          }
        });

        // Assert
        expect(res.statusCode).toEqual(400);
      });
    });

    describe.skip("when `event` is not in `nextEvents`", () => {
      it("should return 400", async () => {

        // Arrange
        const workflow = await workflowService.createOrUpdateWorkflowRuntime({});
        const loginInjectOptions = {
          method: "POST",
          url: "/api/v1/internal/auth/login",
          body: {
            email: "login@test.com",
            password: "password"
          }
        } satisfies InjectOptions;
        const injectOptions = {
          method: "POST",
          url: `/api/v1/internal/workflows/${workflow?.[0]?.workflowRuntimeData?.id}/event`,
          body: {
            name: "approve"
          }
        } satisfies InjectOptions;

        // Act
        const loginRes = await app.inject(loginInjectOptions);
        const res = await app.inject({
          ...injectOptions,
          headers: {
            Cookie: loginRes.headers['set-cookie']
          }
        });

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
              id: endUser?.id,
              type: "individual",
              data: {
                firstName: "John",
                lastName: "Doe"
              }
            },
            documents: []
          }
        });
        const loginInjectOptions = {
          method: "POST",
          url: "/api/v1/internal/auth/login",
          body: {
            email: "login@test.com",
            password: "password"
          }
        } satisfies InjectOptions;
        const injectOptions = {
          method: "POST",
          url: `/api/v1/internal/workflows/${workflow?.[0]?.workflowRuntimeData?.id}/event`,
          body: {
            name: "approve"
          }
        } satisfies InjectOptions;

        // Act
        const loginRes = await app.inject(loginInjectOptions);
        const res = await app.inject({
          ...injectOptions,
          headers: {
            Cookie: loginRes.headers['set-cookie']
          }
        });
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
        const loginInjectOptions = {
          method: "POST",
          url: "/api/v1/internal/auth/login",
          body: {
            email: "login@test.com",
            password: "password"
          }
        } satisfies InjectOptions;
        const injectOptions = {
          method: "POST",
          url: `/api/v1/internal/workflows/${workflow?.[0]?.workflowRuntimeData?.id}/event`,
          body: {
            name: "approve"
          }
        } satisfies InjectOptions;

        // Act
        const loginRes = await app.inject(loginInjectOptions);
        const res = await app.inject({
          ...injectOptions,
          headers: {
            Cookie: loginRes.headers['set-cookie']
          }
        });

        // Assert
        expect(res.statusCode).toEqual(200);
        expect(webhookResponse).toMatchObject(nockResponse);

        nock.cleanAll();

      });
    });
  });

  describe("GET /", () => {
    describe("when unauthenticated", () => {
      it("should return 401", async () => {

        // Arrange
        const filter = await filterService.create({
          data: {
            name: "name1",
            entity: "individuals",
            query: {
              select: {
                endUser: {
                  select: {
                    firstName: true
                  }
                }
              }
            }
          }
        });
        const queryParams = qs.stringify({
          filterId: filter.id,
          orderBy: "createdAt:asc",
          page: {
            number: 1,
            size: 10
          }
        }, { encode: false });
        const injectOptions = {
          method: "GET",
          url: `/api/v1/internal/workflows?${queryParams}`
        } satisfies InjectOptions;

        // Act
        const res = await app.inject(injectOptions);

        // Assert
        expect(res.statusCode).toEqual(401);
      });
    });

    describe("when no workflows exist", () => {
      it("should return 1 page, 0 total, and an empty results array", async () => {

        // Arrange
        const filter = await filterService.create({
          data: {
            name: "name2",
            entity: "individuals",
            query: {
              select: {
                endUser: {
                  select: {
                    firstName: true
                  }
                }
              }
            }
          }
        });
        const queryParams = qs.stringify({
          filterId: filter.id,
          orderBy: "createdAt:asc",
          page: {
            number: 1,
            size: 10
          }
        }, { encode: false });
        const loginInjectOptions = {
          method: "POST",
          url: "/api/v1/internal/auth/login",
          body: {
            email: "login@test.com",
            password: "password"
          }
        } satisfies InjectOptions;
        const injectOptions = {
          method: "GET",
          url: `/api/v1/internal/workflows?${queryParams}`
        } satisfies InjectOptions;

        // Act
        const loginRes = await app.inject(loginInjectOptions);
        const res = await app.inject({
          ...injectOptions,
          headers: {
            Cookie: loginRes.headers['set-cookie']
          }
        });

        // Assert
        expect(res.statusCode).toEqual(200);
        expect(res.json()).toEqual({
          meta: {
            totalItems: 0,
            totalPages: 1
          },
          data: []
        });
      });
    });

    describe("when workflows exist", () => {
      it("should return an array of workflows", async () => {

        // Arrange
        const filter = await filterService.create({
          data: {
            name: "name3",
            entity: "individuals",
            query: {
              select: {
                id: true,
                status: true,
                createdAt: true,
                endUser: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                },
                workflowDefinition: {
                  select: {
                    id: true
                  }
                }
              }
            }
          }
        });
        const endUser = await endUserService.create({
          data: {
            firstName: "John",
            lastName: "Doe"
          }
        });
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
                firstName: "Bob",
                lastName: "Smith"
              }
            },
            documents: []
          }
        });

        const queryParams = qs.stringify({
          filterId: filter.id,
          orderBy: "createdAt:asc",
          page: {
            number: 1,
            size: 10
          }
        }, { encode: false });
        const loginInjectOptions = {
          method: "POST",
          url: "/api/v1/internal/auth/login",
          body: {
            email: "login@test.com",
            password: "password"
          }
        } satisfies InjectOptions;
        const injectOptions = {
          method: "GET",
          url: `/api/v1/internal/workflows?${queryParams}`
        } satisfies InjectOptions;

        // Act
        const loginRes = await app.inject(loginInjectOptions);
        const res = await app.inject({
          ...injectOptions,
          headers: {
            Cookie: loginRes.headers['set-cookie']
          }
        });
        const json = await res.json();

        // Assert
        expect(res.statusCode).toEqual(200);
        expect(json).toEqual({
          meta: {
            totalItems: 2,
            totalPages: 1
          },
          data: [
            {
              id: workflow1?.[0].workflowRuntimeData?.id,
              entity: {
                name: "John Doe"
              },
              assignee: null,
              status: "active",
              createdAt: expect.any(String)
            },
            {
              id: workflow2?.[0].workflowRuntimeData?.id,
              entity: {
                name: "Bob Smith"
              },
              assignee: null,
              status: "active",
              createdAt: expect.any(String)
            }
          ]
        });
      });
    });

  });

  describe("GET /active-states", () => {
    describe("when unauthenticated", () => {
      it("should return 401", async () => {

        // Arrange
        const injectOptions = {
          method: "GET",
          url: "/api/v1/internal/workflows/active-states"
        } satisfies InjectOptions;

        // Act
        const res = await app.inject(injectOptions);

        // Assert
        expect(res.statusCode).toEqual(401);
      });
    });

    describe("when no workflows exist", () => {
      it("should return an empty array", async () => {

        // Arrange
        const loginInjectOptions = {
          method: "POST",
          url: "/api/v1/internal/auth/login",
          body: {
            email: "login@test.com",
            password: "password"
          }
        } satisfies InjectOptions;
        const injectOptions = {
          method: "GET",
          url: "/api/v1/internal/workflows/active-states"
        } satisfies InjectOptions;

        // Act
        const loginRes = await app.inject(loginInjectOptions);
        const res = await app.inject({
          ...injectOptions,
          headers: {
            Cookie: loginRes.headers['set-cookie']
          }
        });
        const json = await res.json();

        // Assert
        expect(res.statusCode).toEqual(200);
        expect(json).toEqual([]);
      });
    });

    describe("when workflows exist", () => {
      it("should return an array of workflows", async () => {

        // Arrange
        const workflowDefinition = await workflowService.createWorkflowDefinition({
          name: "name",
          definitionType: "statechart-json",
          definition: {}
        });
        await workflowService.createOrUpdateWorkflowRuntime({
          workflowDefinitionId: workflowDefinition?.id,
          context: {
            entity: {
              id: "5",
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
        await workflowService.createOrUpdateWorkflowRuntime({
          workflowDefinitionId: workflowDefinition?.id,
          context: {
            entity: {
              id: "6",
              type: "individual",
              data: {
                firstName: "Bob",
                lastName: "Smith"
              }
            },
            documents: []
          },
          config: {}
        });
        const loginInjectOptions = {
          method: "POST",
          url: "/api/v1/internal/auth/login",
          body: {
            email: "login@test.com",
            password: "password"
          }
        } satisfies InjectOptions;
        const injectOptions = {
          method: "GET",
          url: "/api/v1/internal/workflows/active-states"
        } satisfies InjectOptions;

        // Act
        const loginRes = await app.inject(loginInjectOptions);
        const res = await app.inject({
          ...injectOptions,
          headers: {
            Cookie: loginRes.headers['set-cookie']
          }
        });
        const json = await res.json();

        // Assert
        expect(res.statusCode).toEqual(200);
        expect(json).toEqual([
          expect.objectContaining({
            id: expect.any(String),
            assigneeId: null,
            businessId: null,
            endUserId: expect.any(String),
            state: null,
            status: "active",
            workflowDefinitionId: expect.any(String)
          }),
          expect.objectContaining({
            id: expect.any(String),
            assigneeId: null,
            businessId: null,
            endUserId: expect.any(String),
            state: null,
            status: "active",
            workflowDefinitionId: expect.any(String)
          })
        ]);
      });
    });
  });

  describe("GET /:id", () => {
    describe("when unauthenticated", () => {
      it("should return 401", async () => {

        // Arrange
        const filter = await filterService.create({
          data: {
            name: "name4",
            entity: "individuals",
            query: {
              select: {
                endUser: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true
                  }
                },
                workflowDefinition: {
                  select: {
                    id: true
                  }
                }
              }
            }
          }
        });
        const injectOptions = {
          method: "GET",
          url: `/api/v1/internal/workflows/1?filterId=${filter.id}`
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
        const filter = await filterService.create({
          data: {
            name: "name5",
            entity: "individuals",
            query: {
              select: {
                endUser: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true
                  }
                },
                workflowDefinition: {
                  select: {
                    id: true
                  }
                }
              }
            }
          }
        });
        const loginInjectOptions = {
          method: "POST",
          url: "/api/v1/internal/auth/login",
          body: {
            email: "login@test.com",
            password: "password"
          }
        } satisfies InjectOptions;
        const injectOptions = {
          method: "GET",
          url: `/api/v1/internal/workflows/1?filterId=${filter.id}`
        } satisfies InjectOptions;

        // Act
        const loginRes = await app.inject(loginInjectOptions);
        const res = await app.inject({
          ...injectOptions,
          headers: {
            Cookie: loginRes.headers['set-cookie']
          }
        });

        // Assert
        expect(res.statusCode).toEqual(404);
      });
    });

    describe("when the workflow exists", () => {
      it("should return the workflow belonging to the id", async () => {

        // Arrange
        const filter = await filterService.create({
          data: {
            name: "name6",
            entity: "individuals",
            query: {
              select: {
                endUser: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true
                  }
                },
                workflowDefinition: {
                  select: {
                    id: true
                  }
                }
              }
            }
          }
        });
        const workflowDefinition = await workflowService.createWorkflowDefinition({
          name: "test",
          definitionType: "statechart-json",
          definition: {}
        });
        const workflow = await workflowService.createOrUpdateWorkflowRuntime({
          workflowDefinitionId: workflowDefinition?.id,
          config: {},
          context: {
            entity: {
              id: "10",
              type: "individual",
              data: {
                firstName: "John",
                lastName: "Doe"
              }
            },
            documents: []
          }
        });
        const loginInjectOptions = {
          method: "POST",
          url: "/api/v1/internal/auth/login",
          body: {
            email: "login@test.com",
            password: "password"
          }
        } satisfies InjectOptions;
        const injectOptions = {
          method: "GET",
          url: `/api/v1/internal/workflows/${workflow?.[0]?.workflowRuntimeData?.id}?filterId=${filter.id}`
        } satisfies InjectOptions;

        // Act
        const loginRes = await app.inject(loginInjectOptions);
        const res = await app.inject({
          ...injectOptions,
          headers: {
            Cookie: loginRes.headers['set-cookie']
          }
        });
        const json = await res.json();

        // Assert
        expect(res.statusCode).toEqual(200);
        expect(json).toEqual({
          entity: {
            id: expect.any(String),
            name: "John Doe"
          },
          context: {},
          workflowDefinition: {
            id: workflow?.[0]?.workflowDefinition?.id
          },
          nextEvents: expect.any(Array)
        });
      });
    });
  });

  describe("PATCH /:id", () => {
    describe("when unauthenticated", () => {
      it("should return 401", async () => {

        // Arrange
        const injectOptions = {
          method: "PATCH",
          url: "/api/v1/internal/workflows/1",
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
        const loginInjectOptions = {
          method: "POST",
          url: "/api/v1/internal/auth/login",
          body: {
            email: "login@test.com",
            password: "password"
          }
        } satisfies InjectOptions;
        const injectOptions = {
          method: "PATCH",
          url: `/api/v1/internal/workflows/1`,
          body: {}
        } satisfies InjectOptions;

        // Act
        const loginRes = await app.inject(loginInjectOptions);
        const res = await app.inject({
          ...injectOptions,
          headers: {
            Cookie: loginRes.headers['set-cookie']
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
          name: "name",
          definitionType: "statechart-json",
          definition: {}
        });
        const workflow = await workflowService.createOrUpdateWorkflowRuntime({
          workflowDefinitionId: workflowDefinition?.id,
          context: {
            entity: {
              id: "3",
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
        const loginInjectOptions = {
          method: "POST",
          url: "/api/v1/internal/auth/login",
          body: {
            email: "login@test.com",
            password: "password"
          }
        } satisfies InjectOptions;
        const injectOptions = {
          method: "PATCH",
          url: `/api/v1/internal/workflows/${workflow?.[0]?.workflowRuntimeData?.id}`
        } satisfies InjectOptions;

        // Act
        const loginRes = await app.inject(loginInjectOptions)
        const res = await app.inject({
          ...injectOptions,
          headers: {
            Cookie: loginRes.headers['set-cookie']
          }
        });

        // Assert
        expect(res.statusCode).toEqual(400);
      });
    });

    describe("when fields are invalid", () => {
      it("should return 400", async () => {

        // Arrange
        const workflowDefinition = await workflowService.createWorkflowDefinition({
          name: "name",
          definitionType: "statechart-json",
          definition: {}
        });
        const workflow = await workflowService.createOrUpdateWorkflowRuntime({
          workflowDefinitionId: workflowDefinition?.id,
          context: {
            entity: {
              id: "10",
              type: "individual",
              data: {
                firstName: "John",
                lastName: "Doe"
              }
            },
            documents: []
          }
        });
        const loginInjectOptions = {
          method: "POST",
          url: "/api/v1/internal/auth/login",
          body: {
            email: "login@test.com",
            password: "password"
          }
        } satisfies InjectOptions;
        const injectOptions = {
          method: "PATCH",
          url: `/api/v1/internal/workflows/${workflow?.[0]?.workflowRuntimeData?.id}`,
          body: {
            state: {},
            context: false,
            status: [],
            resolvedAt: 123,
            assigneeId: {}
          }
        } satisfies InjectOptions;

        // Act
        const loginRes = await app.inject(loginInjectOptions)
        const res = await app.inject({
          ...injectOptions,
          headers: {
            Cookie: loginRes.headers['set-cookie']
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

  describe("PATCH /assign/:id", () => {
    describe("when unauthenticated", () => {
      it("should return 401", async () => {

        // Arrange
        const injectOptions = {
          method: "PATCH",
          url: "/api/v1/internal/workflows/assign/1",
          body: {
            assigneeId: "assigneeId1"
          }
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
        const loginInjectOptions = {
          method: "POST",
          url: "/api/v1/internal/auth/login",
          body: {
            email: "login@test.com",
            password: "password"
          }
        } satisfies InjectOptions;
        const injectOptions = {
          method: "PATCH",
          url: `/api/v1/internal/workflows/assign/1`,
          body: {
            assigneeId: "assigneeId1"
          }
        } satisfies InjectOptions;

        // Act
        const loginRes = await app.inject(loginInjectOptions);
        const res = await app.inject({
          ...injectOptions,
          headers: {
            Cookie: loginRes.headers['set-cookie']
          }
        });

        // Assert
        expect(res.statusCode).toEqual(404);
      });
    });

    describe("when the assignee belonging to the `assigneeId` does not exist", () => {
      it("should return 404", async () => {

        // Arrange
        const workflow = await workflowService.createWorkflowDefinition({
          name: "test",
          definitionType: "statechart-json",
          definition: {}
        });
        const loginInjectOptions = {
          method: "POST",
          url: "/api/v1/internal/auth/login",
          body: {
            email: "login@test.com",
            password: "password"
          }
        } satisfies InjectOptions;
        const injectOptions = {
          method: "PATCH",
          url: `/api/v1/internal/workflows/assign/${workflow?.id}`,
          body: {
            assigneeId: "assigneeId1"
          }
        } satisfies InjectOptions;

        // Act
        const loginRes = await app.inject(loginInjectOptions);
        const res = await app.inject({
          ...injectOptions,
          headers: {
            Cookie: loginRes.headers['set-cookie']
          }
        });

        // Assert
        expect(res.statusCode).toEqual(404);
      });
    });

    describe("when the workflow is not assigned", () => {
      it("should assign a user to the workflow", async () => {

        // Arrange
        const user = await userService.create({
          data: {
            email: "test1@test1.com",
            firstName: "Bob",
            lastName: "Smith",
            password: "password",
            roles: ["user"]
          }
        });
        const workflowDefinition = await workflowService.createWorkflowDefinition({
          name: "test",
          definitionType: "statechart-json",
          definition: {}
        });
        const workflow = await workflowService.createOrUpdateWorkflowRuntime({
          workflowDefinitionId: workflowDefinition?.id,
          context: {
            entity: {
              id: "7",
              type: "individual",
              data: {
                firstName: "John",
                lastName: "Doe"
              }
            },
            documents: []
          }
        });
        const loginInjectOptions = {
          method: "POST",
          url: "/api/v1/internal/auth/login",
          body: {
            email: "login@test.com",
            password: "password"
          }
        } satisfies InjectOptions;
        const injectOptions = {
          method: "PATCH",
          url: `/api/v1/internal/workflows/assign/${workflow?.[0]?.workflowRuntimeData?.id}`,
          body: {
            assigneeId: user?.id
          }
        } satisfies InjectOptions;

        // Act
        const loginRes = await app.inject(loginInjectOptions);
        const res = await app.inject({
          ...injectOptions,
          headers: {
            Cookie: loginRes.headers['set-cookie']
          }
        });

        // Assert
        expect(res.statusCode).toEqual(200);
      });
    });

    describe.skip("when the workflow is already assigned", () => {
      it("should return 400", async () => {

        // Arrange
        const user1 = await userService.create({
          data: {
            email: "test1@test1.com",
            firstName: "John",
            lastName: "Doe",
            password: "password",
            roles: ["user"]
          }
        });
        const user2 = await userService.create({
          data: {
            email: "test2@test2.com",
            firstName: "Bob",
            lastName: "Smith",
            password: "password",
            roles: ["user"]
          }
        });
        const workflow = await workflowService.createWorkflowDefinition({
          name: "test",
          definitionType: "statechart-json",
          definition: {}
        });
        const loginInjectOptions = {
          method: "POST",
          url: "/api/v1/internal/auth/login",
          body: {
            email: "login@test.com",
            password: "password"
          }
        } satisfies InjectOptions;
        const injectOptions = {
          method: "PATCH",
          url: `/api/v1/internal/workflows/assign/${workflow?.id}`,
          body: {
            assigneeId: user1?.id
          }
        } satisfies InjectOptions;
        const alreadyAssignedInjectOptions = {
          method: "PATCH",
          url: `/api/v1/internal/workflows/assign/${workflow?.id}`,
          body: {
            assigneeId: user2?.id
          }
        } satisfies InjectOptions;

        // Act
        const loginRes = await app.inject(loginInjectOptions);
        await app.inject({
          ...injectOptions,
          headers: {
            Cookie: loginRes.headers['set-cookie']
          }
        });
        const alreadyAssignedRes = await app.inject({
          ...alreadyAssignedInjectOptions,
          headers: {
            Cookie: loginRes.headers['set-cookie']
          }
        });

        // Assert
        expect(alreadyAssignedRes.statusCode).toEqual(400);
      });
    });
  });

  describe("DELETE /:id", () => {
    describe("when unauthenticated", () => {
      it("should return 401", async () => {

        // Arrange
        const injectOptions = {
          method: "DELETE",
          url: "/api/v1/internal/workflows/1"
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
        const loginInjectOptions = {
          method: "POST",
          url: "/api/v1/internal/auth/login",
          body: {
            email: "login@test.com",
            password: "password"
          }
        } satisfies InjectOptions;
        const injectOptions = {
          method: "DELETE",
          url: "/api/v1/internal/workflows/1"
        } satisfies InjectOptions;

        // Act
        const loginRes = await app.inject(loginInjectOptions);
        const res = await app.inject({
          ...injectOptions,
          headers: {
            Cookie: loginRes.headers['set-cookie']
          }
        });

        // Assert
        expect(res.statusCode).toEqual(404);
      });
    });

    describe("when the workflow definition exists", () => {
      it("should delete the workflow definition", async () => {

        // Arrange
        const workflow = await workflowService.createWorkflowDefinition({
          name: "test",
          definitionType: "statechart-json",
          definition: {}
        });
        const loginInjectOptions = {
          method: "POST",
          url: "/api/v1/internal/auth/login",
          body: {
            email: "login@test.com",
            password: "password"
          }
        } satisfies InjectOptions;
        const injectOptions = {
          method: "DELETE",
          url: `/api/v1/internal/workflows/${workflow?.id}`
        } satisfies InjectOptions;

        // Act
        const loginRes = await app.inject(loginInjectOptions);
        const res = await app.inject({
          ...injectOptions,
          headers: {
            Cookie: loginRes.headers['set-cookie']
          }
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

});