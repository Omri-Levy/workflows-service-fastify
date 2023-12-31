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

describe("POST /api/v1/external/workflows/intent #api #integration #external", () => {
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