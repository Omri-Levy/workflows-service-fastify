import { WorkflowService } from "@/workflow/workflow.service";
import { ForbiddenError } from "@/common/errors/forbidden-error";
import { FastifyRequest } from "fastify";
import { IObjectWithId } from "@/types";
import { BusinessRepository } from "@/business/business.repository";
import { db } from "@/db/client";
import { WorkflowDefinitionRepository } from "@/workflow/workflow-definition.repository";
import { WorkflowRuntimeDataRepository } from "@/workflow/workflow-runtime-data.repository";
import { EndUserRepository } from "@/end-user/end-user.repository";
import { FileRepository } from "@/storage/storage.repository";
import { FileService } from "@/providers/file/file.service";
import { StorageService } from "@/storage/storage.service";
import { WorkflowEventEmitterService } from "@/workflow/workflow-event-emitter.service";
import { HttpService } from "@/http/http.service";
import { env } from "@/env";
import { DocumentChangedWebhookCaller } from "@/events/document-changed-webhook-caller";
import { WorkflowStateChangedWebhookCaller } from "@/events/workflow-state-changed-webhook-caller";
import { WorkflowCompletedWebhookCaller } from "@/events/workflow-completed-webhook-caller";
import { TWebhookConfig } from "@/events/types";

export const workflowAssigneePreHandler = async (request: FastifyRequest<{
  Params: IObjectWithId;
}>) => {
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
    NODE_ENV: env.NODE_ENV,
    WEBHOOK_URL: env.WEBHOOK_URL,
    WEBHOOK_SECRET: env.WEBHOOK_SECRET
  }  satisfies TWebhookConfig
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
  const workflowId = request.params.id;
  const requestingUserId = request.user?.id;
  const workflowRuntime = await workflowService.getWorkflowRuntimeDataById(workflowId);

  if (workflowRuntime.assigneeId !== requestingUserId) {
    throw new ForbiddenError('Not authorized');
  }
};