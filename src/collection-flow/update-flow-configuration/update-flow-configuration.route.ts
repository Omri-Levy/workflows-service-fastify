import { db } from "@/db/client";


import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import {
  UpdateFlowConfigurationRouteSchema
} from "@/collection-flow/update-flow-configuration/update-flow-configuration.schema";
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
import EventEmitter from "events";

export const updateFlowConfigurationRoute: FastifyPluginAsyncTypebox = async (app) => {
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

  app.route({
    method: "GET",
    url: "/",
    schema: UpdateFlowConfigurationRouteSchema,
    handler: async (req, reply) => {
      const updatedFlowConfiguration = await collectionFlowService.updateFlowConfiguration(req.params.configurationId, req.body.steps);

      return reply.send(updatedFlowConfiguration)
    }
  });
};