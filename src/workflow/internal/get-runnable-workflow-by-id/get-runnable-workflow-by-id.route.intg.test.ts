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

describe("GET /api/v1/internal/workflows/:id #api #integration #internal", () => {
  let app: TApp;
  const businessRepository = new BusinessRepository(
    db
  );
  const workflowDefinitionRepository = new WorkflowDefinitionRepository(db);
  const workflowRuntimeDataRepository = new WorkflowRuntimeDataRepository(db);
  const endUserRepository = new EndUserRepository(db);
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
      const injectOptions = {
        method: "GET",
        url: `/api/v1/internal/workflows/1?filterId=${filter.id}`
      } satisfies InjectOptions;

      // Act
      const authHeaders = await authFn.getHeaders();
      const res = await app.inject({
        ...injectOptions,
        ...authHeaders
      });

      // Assert
      expect(res.statusCode).toEqual(404);
    });
  });

  describe("when the workflow exists", () => {
    it("should return the workflow belonging to the given id", async () => {

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
      const injectOptions = {
        method: "GET",
        url: `/api/v1/internal/workflows/${workflow?.[0]?.workflowRuntimeData?.id}?filterId=${filter.id}`
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