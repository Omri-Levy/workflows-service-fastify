import { build, TApp } from "@/server";
import { BusinessRepository } from "@/business/business.repository";
import { db } from "@/db/client";
import { WorkflowDefinitionRepository } from "@/workflow/workflow-definition.repository";
import { WorkflowRuntimeDataRepository } from "@/workflow/workflow-runtime-data.repository";
import { EndUserRepository } from "@/end-user/end-user.repository";
import { EndUserService } from "@/end-user/end-user.service";
import { FileRepository } from "@/storage/storage.repository";
import { FileService } from "@/providers/file/file.service";
import { StorageService } from "@/storage/storage.service";
import { WorkflowEventEmitterService } from "@/workflow/workflow-event-emitter.service";
import { HttpService } from "@/http/http.service";
import { TWebhookConfig } from "@/events/types";
import { DocumentChangedWebhookCaller } from "@/events/document-changed-webhook-caller";
import { WorkflowStateChangedWebhookCaller } from "@/events/workflow-state-changed-webhook-caller";
import { WorkflowCompletedWebhookCaller } from "@/events/workflow-completed-webhook-caller";
import { WorkflowService } from "@/workflow/workflow.service";
import { FilterRepository } from "@/filter/filter.repository";
import { FilterService } from "@/filter/filter.service";
import { PasswordService } from "@/auth/password/password.service";
import { UserRepository } from "@/user/user.repository";
import { UserService } from "@/user/user.service";
import { AuthSetupFn, setupAuth } from "@/test/setup-auth";
import { cleanupDatabase, tearDownDatabase } from "@/test/helpers/database-helper";
import { InjectOptions } from "fastify";

describe("PATCH /api/v1/internal/workflows/:id #api #integration #internal", () => {
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
      const injectOptions = {
        method: "PATCH",
        url: `/api/v1/internal/workflows/1`,
        body: {}
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
      const injectOptions = {
        method: "PATCH",
        url: `/api/v1/internal/workflows/${workflow?.[0]?.workflowRuntimeData?.id}`
      } satisfies InjectOptions;

      // Act
      const authHeaders = await authFn.getHeaders();
      const res = await app.inject({
        ...injectOptions,
        ...authHeaders
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
      const authHeaders = await authFn.getHeaders();
      const res = await app.inject({
        ...injectOptions,
        ...authHeaders
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