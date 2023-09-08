import { db } from "@/db/client";


import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { UpdateFlowRouteSchema } from "@/collection-flow/update-flow/update-flow.schema";
import { env } from "@/env";
import { TWebhookConfig } from "@/events/types";
import { BusinessRepository } from "@/business/business.repository";
import { WorkflowDefinitionRepository } from "@/workflow/workflow-definition.repository";
import { WorkflowRuntimeDataRepository } from "@/workflow/workflow-runtime-data.repository";
import { EndUserRepository } from "@/end-user/end-user.repository";
import { FileRepository } from "@/storage/storage.repository";
import { WorkflowEventEmitterService } from "@/workflow/workflow-event-emitter.service";
import { HttpService } from "@/http/http.service";
import { DocumentChangedWebhookCaller } from "@/events/document-changed-webhook-caller";
import { WorkflowStateChangedWebhookCaller } from "@/events/workflow-state-changed-webhook-caller";
import { WorkflowCompletedWebhookCaller } from "@/events/workflow-completed-webhook-caller";
import { EndUserService } from "@/end-user/end-user.service";
import { FileService } from "@/providers/file/file.service";
import { StorageService } from "@/storage/storage.service";
import { WorkflowService } from "@/workflow/workflow.service";
import { BusinessService } from "@/business/business.service";
import { CollectionFlowService } from "@/collection-flow/collection-flow.service";
import { Customer } from "@prisma/client";
import { UnsupportedFlowTypeException } from "@/collection-flow/exceptions/unsupported-flow-type.exception";
import EventEmitter from "events";
import { WorkflowAdapterManager } from "@/collection-flow/workflow-adapter.manager";
import { BadRequestError } from "@/common/errors/bad-request-error";
import { getProjectIds } from "@/common/utils/get-project-ids/get-project-ids";

export const updateFlowRoute: FastifyPluginAsyncTypebox = async (app) => {
  const eventEmitter = new EventEmitter();
  const config = {
    NODE_ENV: env.NODE_ENV,
    WEBHOOK_URL: env.WEBHOOK_URL,
    WEBHOOK_SECRET: env.WEBHOOK_SECRET
  }  satisfies TWebhookConfig

  const businessRepository = new BusinessRepository(
    db
  );
  const workflowDefinitionRepository = new WorkflowDefinitionRepository(db);
  const workflowRuntimeDataRepository = new WorkflowRuntimeDataRepository(db);
  const endUserRepository = new EndUserRepository(db);
  const fileRepository = new FileRepository(db);

  const workflowEventEmitterService = new WorkflowEventEmitterService(eventEmitter);
  const httpService = new HttpService();

  const documentChangedWebhookCaller = new DocumentChangedWebhookCaller(
    httpService,
    workflowEventEmitterService,
    config,
  );
  const workflowStateChangedWebhookCaller = new WorkflowStateChangedWebhookCaller(
    httpService,
    workflowEventEmitterService,
    config,
  );
  const workflowCompletedWebhookCaller = new WorkflowCompletedWebhookCaller(
    httpService,
    workflowEventEmitterService,
    config,
  );

  const endUserService = new EndUserService(
    endUserRepository,
  );
  const fileService = new FileService();
  const storageService = new StorageService(fileRepository);
  const workflowService = new WorkflowService(
    workflowDefinitionRepository,
    workflowRuntimeDataRepository,
    endUserRepository,
    businessRepository,
    storageService,
    fileService,
    workflowEventEmitterService,
    documentChangedWebhookCaller,
    workflowStateChangedWebhookCaller,
    workflowCompletedWebhookCaller
  );
  const businessService = new BusinessService(
    businessRepository,
  );
  const collectionFlowService = new CollectionFlowService(
    endUserService,
    workflowRuntimeDataRepository,
    workflowDefinitionRepository,
    workflowService,
    businessService
  );
  const adapterManager = new WorkflowAdapterManager();

  app.route({
    method: "PUT",
    url: "/:flowId",
    schema: UpdateFlowRouteSchema,
    handler: async (req, reply) => {

      try {
        const projectIds = getProjectIds(req);
        const adapter = adapterManager.getAdapter(req.body.flowType);

        return collectionFlowService.updateFlow(
          adapter,
          req.body.payload,
          req.params.flowId,
          projectIds,
          req.user.customer as Customer
        );
      } catch (error) {
        if (error instanceof UnsupportedFlowTypeException) {
          throw new BadRequestError(`${req.body.flowType} is not supported.`);
        }

        throw error;
      }

    }
  });
};