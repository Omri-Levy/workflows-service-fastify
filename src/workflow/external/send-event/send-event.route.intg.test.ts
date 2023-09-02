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

describe("/api/v1/external/workflows #api #integration #external", () => {
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
        url: "/api/v1/external/workflows/1/send-event",
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
        method: "POST",
        url: "/api/v1/external/workflows/1/send-event",
        body: {
          name: "test"
        }
      } satisfies InjectOptions;

      // Act
      const res = await app.inject(injectOptions);

      // Assert
      expect(res.statusCode).toEqual(404);
    });
  });

  describe("when missing required fields", () => {
    it("should return 400", async () => {

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
        method: "POST",
        url: `/api/v1/external/workflows/${workflow?.[0]?.workflowRuntimeData?.id}/send-event`,
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
        method: "POST",
        url: `/api/v1/external/workflows/${workflow?.[0]?.workflowRuntimeData?.id}/send-event`,
        body: {
          name: {}
        }
      } satisfies InjectOptions;

      // Act
      const res = await app.inject(injectOptions);

      // Assert
      expect(res.statusCode).toEqual(400);
    });
  });

  describe.skip("when `event` is not in the workflow definition", () => {
    it("should return 400", async () => {

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
        method: "POST",
        url: `/api/v1/external/workflows/${workflow?.[0]?.workflowRuntimeData?.id}/send-event`,
        body: {
          name: "test"
        }
      } satisfies InjectOptions;

      // Act
      const res = await app.inject(injectOptions);

      // Assert
      expect(res.statusCode).toEqual(400);
    });
  });

  describe.skip("when `event` is not in `nextEvents`", () => {
    it("should return 400", async () => {

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
        method: "POST",
        url: `/api/v1/external/workflows/${workflow?.[0]?.workflowRuntimeData?.id}/send-event`,
        body: {
          name: "approve"
        }
      } satisfies InjectOptions;

      // Act
      const res = await app.inject(injectOptions);

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
      const injectOptions = {
        method: "POST",
        url: `/api/v1/external/workflows/${workflow?.[0]?.workflowRuntimeData?.id}/send-event`,
        body: {
          name: "approve"
        }
      } satisfies InjectOptions;

      // Act
      const res = await app.inject(injectOptions);
      const updatedWorkflow = await workflowService.getWorkflowRuntimeDataById(workflow?.[0]?.workflowRuntimeData?.id);

      // Assert
      expect(res.statusCode).toEqual(204);
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
      const injectOptions = {
        method: "POST",
        url: `/api/v1/external/workflows/${workflow?.[0]?.workflowRuntimeData?.id}/send-event`,
        body: {
          name: "approve"
        }
      } satisfies InjectOptions;

      // Act
      const res = await app.inject(injectOptions);

      // Assert
      expect(res.statusCode).toEqual(204);
      expect(webhookResponse).toMatchObject(nockResponse);

      nock.cleanAll();

    });
  });

});