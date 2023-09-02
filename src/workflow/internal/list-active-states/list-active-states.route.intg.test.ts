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

describe("GET /api/v1/internal/workflows/active-states #api #integration #internal", () => {
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
      const injectOptions = {
        method: "GET",
        url: "/api/v1/internal/workflows/active-states"
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
      const injectOptions = {
        method: "GET",
        url: "/api/v1/internal/workflows/active-states"
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