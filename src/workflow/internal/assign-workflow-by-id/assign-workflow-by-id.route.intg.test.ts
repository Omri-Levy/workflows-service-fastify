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
import { PasswordService } from "@/auth/password/password.service";
import { UserRepository } from "@/user/user.repository";
import { UserService } from "@/user/user.service";

describe("PATCH /api/v1/internal/workflows/assign/:id #api #integration #internal", () => {
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
  const passwordService = new PasswordService();
  const userRepository = new UserRepository(db, passwordService);
  const userService = new UserService(userRepository);
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
      const injectOptions = {
        method: "PATCH",
        url: `/api/v1/internal/workflows/assign/1`,
        body: {
          assigneeId: "assigneeId1"
        }
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

  describe("when the assignee belonging to the `assigneeId` does not exist", () => {
    it("should return 404", async () => {

      // Arrange
      const workflow = await workflowService.createWorkflowDefinition({
        name: "test",
        definitionType: "statechart-json",
        definition: {}
      });
      const injectOptions = {
        method: "PATCH",
        url: `/api/v1/internal/workflows/assign/${workflow?.id}`,
        body: {
          assigneeId: "assigneeId1"
        }
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
      const injectOptions = {
        method: "PATCH",
        url: `/api/v1/internal/workflows/assign/${workflow?.[0]?.workflowRuntimeData?.id}`,
        body: {
          assigneeId: user?.id
        }
      } satisfies InjectOptions;

      // Act
      const authHeaders = await authFn.getHeaders();
      const res = await app.inject({
        ...injectOptions,
        ...authHeaders
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
      const authHeaders = await authFn.getHeaders();
      await app.inject({
        ...injectOptions,
        ...authHeaders
      });
      const alreadyAssignedRes = await app.inject({
        ...alreadyAssignedInjectOptions,
        ...authHeaders
      });

      // Assert
      expect(alreadyAssignedRes.statusCode).toEqual(400);
    });
  });

});