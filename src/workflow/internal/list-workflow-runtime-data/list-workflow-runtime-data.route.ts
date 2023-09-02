import {
  ListWorkflowRuntimeDataRouteInternalSchema
} from "@/workflow/internal/list-workflow-runtime-data/list-workflow-runtime-data.schema";
import { FindWorkflowsListLogicSchema } from "@/workflow/dtos/find-workflows-list.dto";
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
import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import EventEmitter from "events";

export const listWorkflowRuntimeDataRouteInternal: FastifyPluginAsyncTypebox = async (app) => {

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
    url: "/",
    schema: ListWorkflowRuntimeDataRouteInternalSchema,
    handler: async (req, reply) => {
      const { filterId, page, filter: filters, ...queryParams } = req.query;
      const filter = await filterService.getById(filterId);
      const entityType = filter.entity as "individuals" | "businesses";
      const { orderBy } = FindWorkflowsListLogicSchema[entityType].parse(queryParams);
      const workflowsRuntimeDataWithRelations = await workflowService.listWorkflowRuntimeDataWithRelations({
        args: filter.query as any,
        entityType,
        orderBy,
        page,
        filters
      });

      return reply.send(workflowsRuntimeDataWithRelations);
    }
  });
};