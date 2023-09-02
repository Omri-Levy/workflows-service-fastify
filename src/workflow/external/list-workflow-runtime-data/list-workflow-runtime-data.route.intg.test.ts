import { build, TApp } from "@/server";
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

describe("GET /api/v1/external/workflows #api #integration #external", () => {
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

  beforeAll(async () => {
    app = await build();
  });
  beforeEach(async () => {
    await cleanupDatabase(db);
  });
  afterAll(async () => {
    await tearDownDatabase(db);
  });

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