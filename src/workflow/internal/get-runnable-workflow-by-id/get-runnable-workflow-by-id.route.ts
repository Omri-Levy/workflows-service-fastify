import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import {
  GetRunnableWorkflowByIdRouteInternalSchema
} from "@/workflow/internal/get-runnable-workflow-by-id/get-runnable-workflow-by-id.schema";
import { NotFoundError } from "@/common/errors/not-found-error";
import { isRecordNotFoundError } from "@/db/db.util";
import { EndUserRepository } from "@/end-user/end-user.repository";
import { db } from "@/db/client";
import { WorkflowDefinitionRepository } from "@/workflow/workflow-definition.repository";
import { WorkflowRuntimeDataRepository } from "@/workflow/workflow-runtime-data.repository";
import { BusinessRepository } from "@/business/business.repository";
import { FileRepository } from "@/storage/storage.repository";
import { StorageService } from "@/storage/storage.service";
import { FileService } from "@/providers/file/file.service";
import { FilterRepository } from "@/filter/filter.repository";
import { FilterService } from "@/filter/filter.service";
import { WorkflowEventEmitterService } from "@/workflow/workflow-event-emitter.service";
import { HttpService } from "@/http/http.service";
import { env } from "@/env";
import { TWebhookConfig } from "@/events/types";
import { DocumentChangedWebhookCaller } from "@/events/document-changed-webhook-caller";
import { WorkflowStateChangedWebhookCaller } from "@/events/workflow-state-changed-webhook-caller";
import { WorkflowCompletedWebhookCaller } from "@/events/workflow-completed-webhook-caller";
import { WorkflowService } from "@/workflow/workflow.service";
import EventEmitter from "events";

export const getRunnableWorkflowByIdRouteInternal: FastifyPluginAsyncTypebox = async (app) => {

  const endUserRepository = new EndUserRepository(
    db
  );
  const workflowDefinitionRepository = new WorkflowDefinitionRepository(db);
  const workflowRuntimeDataRepository = new WorkflowRuntimeDataRepository(db);
  const businessRepository = new BusinessRepository(db);
  const fileRepository = new FileRepository(db);
  const storageService = new StorageService(fileRepository);
  const fileService = new FileService();
  const filterRepository = new FilterRepository(db);
  const filterService = new FilterService(filterRepository);
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

  app.route({
    method: "GET",
    url: "/:id",
    schema: GetRunnableWorkflowByIdRouteInternalSchema,
    handler: async (req, reply) => {
      try {
        const filter = await filterService.getById(req.query.filterId);
        const workflowRuntimeData = await workflowService.getWorkflowByIdWithRelations(req.params.id, filter.query as any);

        return reply.send(workflowRuntimeData);
      } catch (err) {

        if (isRecordNotFoundError(err)) {
          throw new NotFoundError(`No resource was found for ${JSON.stringify(req.params.id)}`)
        }

        throw err;
      }
    }
  });
};