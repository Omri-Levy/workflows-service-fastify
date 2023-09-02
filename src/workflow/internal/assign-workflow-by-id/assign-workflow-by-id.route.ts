import { NotFoundError } from "@/common/errors/not-found-error";
import { isRecordNotFoundError } from "@/db/db.util";
import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import {
  AssignWorkflowByIdRouteSchemaInternal
} from "@/workflow/internal/assign-workflow-by-id/assign-workflow-by-id.schema";
import { EndUserRepository } from "@/end-user/end-user.repository";
import { db } from "@/db/client";
import { WorkflowDefinitionRepository } from "@/workflow/workflow-definition.repository";
import { WorkflowRuntimeDataRepository } from "@/workflow/workflow-runtime-data.repository";
import { BusinessRepository } from "@/business/business.repository";
import { FileRepository } from "@/storage/storage.repository";
import { StorageService } from "@/storage/storage.service";
import { FileService } from "@/providers/file/file.service";
import { WorkflowEventEmitterService } from "@/workflow/workflow-event-emitter.service";
import { HttpService } from "@/http/http.service";
import { env } from "@/env";
import { TWebhookConfig } from "@/events/types";
import { DocumentChangedWebhookCaller } from "@/events/document-changed-webhook-caller";
import { WorkflowStateChangedWebhookCaller } from "@/events/workflow-state-changed-webhook-caller";
import { WorkflowCompletedWebhookCaller } from "@/events/workflow-completed-webhook-caller";
import { WorkflowService } from "@/workflow/workflow.service";
import EventEmitter from "events";

export const assignWorkflowByIdRouteInternal: FastifyPluginAsyncTypebox = async (app) => {

  const endUserRepository = new EndUserRepository(
    db
  );
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
    NODE_ENV: env.NODE_ENV,
    WEBHOOK_URL: env.WEBHOOK_URL,
    WEBHOOK_SECRET: env.WEBHOOK_SECRET
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

  app.route({
    method: "PATCH",
    url: "/assign/:id",
    schema: AssignWorkflowByIdRouteSchemaInternal,
    handler: async (req, reply) => {
      try {
        const workflowRuntimeData = await workflowService.assignWorkflowToUser(req.params.id, req.body);

        return reply.send(workflowRuntimeData);
      } catch (err) {

        if (isRecordNotFoundError(err)) {
          throw new NotFoundError(`No resource was found for ${JSON.stringify(req.params.id)}`);
        }

        throw err;
      }
    }
  });
};