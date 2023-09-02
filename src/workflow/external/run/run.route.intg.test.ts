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

describe("POST /api/v1/external/workflows/run #api #integration #external", () => {
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

  describe.skip("when unauthenticated", () => {
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