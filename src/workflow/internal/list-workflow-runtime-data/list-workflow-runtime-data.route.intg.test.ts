import qs from "qs";
import { build, TApp } from "@/server";
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
import { db } from "@/db/client";
import { WorkflowEventEmitterService } from "@/workflow/workflow-event-emitter.service";
import EventEmitter from "events";
import { HttpService } from "@/http/http.service";
import { DocumentChangedWebhookCaller } from "@/events/document-changed-webhook-caller";
import { WorkflowStateChangedWebhookCaller } from "@/events/workflow-state-changed-webhook-caller";
import { WorkflowCompletedWebhookCaller } from "@/events/workflow-completed-webhook-caller";
import { TWebhookConfig } from "@/events/types";
import { InjectOptions } from "fastify";
import { AuthSetupFn, setupAuth } from "@/test/setup-auth";

describe("GET /api/v1/internal/workflows #api #integration #internal", () => {
  let app: TApp;
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
  let authFn: AuthSetupFn;

  beforeAll(async () => {
    app = await build();
    authFn = setupAuth(app);
  });
  beforeEach(async () => {
    await cleanupDatabase(db);
    await authFn.createUser();
  });
  afterAll(async () => {
    await tearDownDatabase(db);
  });

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
      const injectOptions = {
        method: "GET",
        url: `/api/v1/internal/workflows?${queryParams}`
      } satisfies InjectOptions;

      // Act
      const authHeaders = await authFn.getHeaders();
      const res = await app.inject({
        ...injectOptions,
        ...authHeaders
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
      const injectOptions = {
        method: "GET",
        url: `/api/v1/internal/workflows?${queryParams}`
      } satisfies InjectOptions;

      // Act
      const authHeaders = await authFn.getHeaders();
      const res = await app.inject({
        ...injectOptions,
        ...authHeaders
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