import { cleanupDatabase, tearDownDatabase } from "@/test/helpers/database-helper";
import { FilterService } from "@/filter/filter.service";
import { FilterRepository } from "@/filter/filter.repository";
import { db } from "@/db/client";
import { build } from "@/server";
import { WorkflowService } from "@/workflow/workflow.service";
import { WorkflowDefinitionRepository } from "@/workflow/workflow-definition.repository";
import { WorkflowRuntimeDataRepository } from "@/workflow/workflow-runtime-data.repository";
import { BusinessRepository } from "@/business/business.repository";
import { FileRepository } from "@/storage/storage.repository";
import { StorageService } from "@/storage/storage.service";
import { FileService } from "@/providers/file/file.service";
import { EndUserRepository } from "@/end-user/end-user.repository";
import { WorkflowEventEmitterService } from "@/workflow/workflow-event-emitter.service";
import EventEmitter from "events";
import { HttpService } from "@/http/http.service";
import { DocumentChangedWebhookCaller } from "@/events/document-changed-webhook-caller";
import { WorkflowStateChangedWebhookCaller } from "@/events/workflow-state-changed-webhook-caller";
import { WorkflowCompletedWebhookCaller } from "@/events/workflow-completed-webhook-caller";
import { TWebhookConfig } from "@/events/types";
import { InjectOptions } from "fastify";

describe("POST /api/v1/external/filters #api #integration #external", () => {
  let app: TApp;
  const filterRepository = new FilterRepository(
    db
  );
  const filterService = new FilterService(
    filterRepository
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

  it("should return 401 for unauthorized requests", async () => {

    // Arrange
    const injectOptions = {
      method: "POST",
      url: "/api/v1/external/filters",
      body: {}
    } satisfies InjectOptions;

    // Act
    const res = await app.inject(injectOptions);


    // Assert
    expect(res.statusCode).toBe(401);
  });

  it("should return 400 for missing required fields", async () => {

    // Arrange
    const injectOptions = {
      method: "POST",
      url: "/api/v1/external/filters",
      body: {}
    } satisfies InjectOptions;

    // Act
    const res = await app.inject(injectOptions);


    // Assert
    expect(res.statusCode).toBe(400);
  });

  it("should return 400 for invalid fields", async () => {

    // Arrange
    const injectOptions = {
      method: "POST",
      url: "/api/v1/external/filters",
      body: {
        name: false,
        entity: {},
        query: []
      }
    } satisfies InjectOptions;

    // Act
    const res = await app.inject(injectOptions);


    // Assert
    expect(res.statusCode).toBe(400);
  });

  it("creates a filter", async () => {

    // Arrange
    const injectOptions = {
      method: "POST",
      url: "/api/v1/external/filters",
      body: {
        name: "test4",
        entity: "businesses",
        query: {
          select: {
            business: {
              select: {
                companyName: true
              }
            }
          },
          where: {
            business: {
              is: {
                companyName: "companyName"
              }
            }
          }
        }
      }
    } satisfies InjectOptions;

    // Act
    const res = await app.inject(injectOptions);
    const json = await res.json();
    const filter = await filterService.getById(json.id);

    // Assert
    expect(res.statusCode).toBe(201);
    expect(json).toMatchObject({
      id: expect.any(String),
      name: "test4",
      entity: "businesses",
      query: {
        select: {
          business: {
            select: {
              companyName: true
            }
          }
        },
        where: {
          business: {
            is: {
              companyName: "companyName"
            }
          }
        }
      },
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      createdBy: "SYSTEM"
    });
    expect(filter).toMatchObject({
      id: expect.any(String),
      name: "test4",
      entity: "businesses",
      query: {
        select: {
          business: {
            select: {
              companyName: true
            }
          }
        },
        where: {
          business: {
            is: {
              companyName: "companyName"
            }
          }
        }
      },
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      createdBy: "SYSTEM"
    });
  });

  it.skip("does not throw when using the created filter", async () => {

    // Arrange
    const endUserRepository = new EndUserRepository(db);
    const workflowDefinitionRepository = new WorkflowDefinitionRepository(db);
    const workflowRuntimeDataRepository = new WorkflowRuntimeDataRepository(db);
    const businessRepository = new BusinessRepository(db);
    const fileRepository = new FileRepository(db);
    const storageService = new StorageService(fileRepository);
    const fileService = new FileService();
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

    // Act
    const filter = await filterService.create({
      data: {
        name: "test5",
        entity: "businesses",
        query: {
          select: {
            business: {
              select: {
                companyName: true
              }
            }
          },
          where: {
            business: {
              is: {
                registrationNumber: "registrationNumber"
              }
            }
          }
        }
      }
    });

    // Assert
    expect(workflowService.listWorkflowRuntimeDataWithRelations({
      args: filter.query as any,
      entityType: "businesses",
      orderBy: "createdAt:asc",
      page: {
        number: 1,
        size: 10
      },
      filters: {}
    })).not.toThrowError();

  });

  it("should return 400 for duplicate `name`", async () => {

    // Arrange
    const injectOptions = {
      method: "POST",
      url: "/api/v1/external/filters",
      body: {
        name: "test",
        entity: "businesses",
        query: {
          select: {
            business: {
              select: {
                companyName: true
              }
            }
          },
          where: {
            business: {
              is: {
                registrationNumber: "registrationNumber"
              }
            }
          }
        }
      }
    } satisfies InjectOptions;
    const duplicateNameInjectOptions = {
      method: "POST",
      url: "/api/v1/external/filters",
      body: {
        name: "test",
        entity: "individuals",
        query: {
          select: {
            endUser: {
              select: {
                lastName: true
              }
            }
          },
          where: {
            endUser: {
              is: {
                firstName: "firstName2"
              }
            }
          }
        }
      }
    } satisfies InjectOptions;

    // Act
    await app.inject(injectOptions);
    const duplicateNameRes = await app.inject(duplicateNameInjectOptions);
    const duplicateNameJson = await duplicateNameRes.json();

    // Assert
    expect(duplicateNameRes.statusCode).toBe(400);
    expect(duplicateNameJson.message).toBe("Name already in use");
  });

});