import { EndUserRepository } from "@/end-user/end-user.repository";
import { db } from "@/db/client";
import { WorkflowService } from "@/workflow/workflow.service";
import { WorkflowDefinitionRepository } from "@/workflow/workflow-definition.repository";
import { WorkflowRuntimeDataRepository } from "@/workflow/workflow-runtime-data.repository";
import { BusinessRepository } from "@/business/business.repository";
import { BusinessService } from "@/business/business.service";
import { FileRepository } from "@/storage/storage.repository";
import { StorageService } from "@/storage/storage.service";
import { FileService } from "@/providers/file/file.service";
import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { BusinessFindManyArgs } from "@/business/dtos/business-find-many-args";
import { isRecordNotFoundError } from "@/db/db.util";
import { makeFullWorkflow } from "@/workflow/utils/make-full-workflow";
import { Type } from "@sinclair/typebox";
import { BusinessSchema, WorkflowDefinitionSchema, WorkflowRuntimeDataSchema } from "@/common/schemas";
import { NotFoundError } from "@/common/errors/not-found-error";
import { WorkflowEventEmitterService } from "@/workflow/workflow-event-emitter.service";
import {EventEmitter} from 'events';
import { HttpService } from "@/http/http.service";
import { env } from "@/env";
import { DocumentChangedWebhookCaller } from "@/events/document-changed-webhook-caller";
import { WorkflowStateChangedWebhookCaller } from "@/events/workflow-state-changed-webhook-caller";
import { WorkflowCompletedWebhookCaller } from "@/events/workflow-completed-webhook-caller";
import { TWebhookConfig } from "@/events/types";

export const businessControllerExternal: FastifyPluginAsyncTypebox = async (fastify) => {
  const businessRepository = new BusinessRepository(
    db
  );
  const businessService = new BusinessService(businessRepository);
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
    NODE_ENV: env.NODE_ENV,
    WEBHOOK_URL: env.WEBHOOK_URL,
    WEBHOOK_SECRET: env.WEBHOOK_SECRET
  } satisfies TWebhookConfig
  const documentChangedWebhookCaller = new DocumentChangedWebhookCaller(
    httpService,
    workflowEventEmitter,
    config,
  );
  const workflowStateChangedWebhookCaller = new WorkflowStateChangedWebhookCaller(
    httpService,
    workflowEventEmitter,
    config,
  );
  const workflowCompletedWebhookCaller = new WorkflowCompletedWebhookCaller(
    httpService,
    workflowEventEmitter,
    config,
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

// create
  fastify.post("/", {
    schema: {
      description: "Create a new business",
      tags: ["External", "Businesses"],
      body: Type.Object({
        companyName: Type.String(),
        registrationNumber: Type.String()
      }, {
        additionalProperties: false
      }),
      response: {
        201: Type.Pick(BusinessSchema, ["id", "companyName"]),
        400: Type.Object({
          status: Type.String(),
          message: Type.String()
        }),
        401: Type.Object({
          status: Type.String(),
          message: Type.String()
        }),
        500: Type.Object({
          status: Type.Optional(Type.String()),
          code: Type.Optional(Type.Number()),
          message: Type.String()
        })
      }
    }
  }, async (req, reply) => {
    const business = await businessService.create({
      data: {
        ...req.body,
        legalForm: "name",
        countryOfIncorporation: "US",
        address: "addess",
        industry: "telecom",
        documents: "s"
      },
      select: {
        id: true,
        companyName: true
      }
    });

    return reply.status(201).send(business);
  });

  // list
  fastify.get("/", {
    schema: {
      description: "Fetch a list of businesses based on query parameters",
      tags: ["External", "Businesses"],
      querystring: BusinessFindManyArgs,
      response: {
        200: Type.Array(Type.Omit(BusinessSchema, ["endUsersOnBusinesses", "workflowRuntimeData", "endUsers"])),
        400: Type.Object({
          status: Type.String(),
          message: Type.String()
        }),
        401: Type.Object({
          status: Type.String(),
          message: Type.String()
        }),
        500: Type.Object({
          status: Type.Optional(Type.String()),
          code: Type.Optional(Type.Number()),
          message: Type.String()
        })
      }
    }
  }, async (req, reply) => {
    const businesses = await businessService.list(req.query);

    return reply.send(businesses);
  });

  // getById
  fastify.get("/:id", {
    schema: {
      description: "Retrieve a business by its unique ID",
      tags: ["External", "Business"],
      params: Type.Object({
        id: Type.String({ description: "Unique ID of the business" })
      }),
      response: {
        200: Type.Omit(BusinessSchema, ["endUsersOnBusinesses", "workflowRuntimeData", "endUsers"]),
        400: Type.Object({
          status: Type.String(),
          message: Type.String()
        }),
        404: Type.Object({
          status: Type.String(),
          message: Type.String()
        }),
        401: Type.Object({
          status: Type.String(),
          message: Type.String()
        }),
        500: Type.Object({
          status: Type.Optional(Type.String()),
          code: Type.Optional(Type.Number()),
          message: Type.String()
        })
      }
    }
  }, async (req, reply) => {
    try {
      const business = await businessService.getById(req.params.id);

      return reply.send(business);
    } catch (err) {
      if (isRecordNotFoundError(err)) {
        throw new NotFoundError(`No resource was found for ${JSON.stringify(req.params.id)}`);
      }

      throw err;
    }
  });

  // listWorkflowsByBusinessId
  fastify.get("/:businessId/workflows", {
    schema: {
      description: "Fetch a list of workflows associated with a specific business",
      tags: ["External", "Workflows"],
      params: Type.Object({
        businessId: Type.String({ description: "ID of the business" })
      }),
      response: {
        200: Type.Array(
          Type.Object({
            workflowDefinition: Type.Omit(WorkflowDefinitionSchema, ["workflowRuntimeData"]),
            workflowRuntimeData: Type.Omit(WorkflowRuntimeDataSchema, ["workflowDefinition"])
          })
        ),
        400: Type.Object({
          status: Type.String(),
          message: Type.String()
        }),
        404: Type.Object({
          status: Type.String(),
          message: Type.String()
        }),
        401: Type.Object({
          status: Type.String(),
          message: Type.String()
        }),
        500: Type.Object({
          status: Type.Optional(Type.String()),
          code: Type.Optional(Type.Number()),
          message: Type.String()
        })
      }
    }
  }, async (req, reply) => {
    const businessId = req.params.businessId;
    const workflowRuntimeDataWithDefinition =
      await workflowService.listFullWorkflowDataByUserId({
        entityId: businessId,
        entity: "business"
      });
    const fullWorkflow = makeFullWorkflow(workflowRuntimeDataWithDefinition);

    return reply.send(fullWorkflow);
  });

};