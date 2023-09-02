import packageJson from "../../package.json";
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
import { randomUUID } from "node:crypto";
import nock from "nock";

describe("GET /api/v1/external/workflows/:id/context #api #integration #external", () => {
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