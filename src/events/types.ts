import { WorkflowRuntimeData } from '@prisma/client';
import { TEventName } from '@/workflow/types';
import { env , env } from '@/env';

export interface IWebhookPayload {
  id: string;
  eventName: TEventName;
  apiVersion: string;
  // ISO string
  timestamp: string;
  workflowCreatedAt: WorkflowRuntimeData['createdAt'];
  workflowResolvedAt: WorkflowRuntimeData['resolvedAt'];
  workflowDefinitionId: string;
  workflowRuntimeId: string;
  ballerineEntityId: string;
  correlationId: string;
  environment: string | undefined;
  data: unknown;
}

export type TWebhookConfig = Pick<
  typeof env,
  | 'NODE_ENV'
  | 'WEBHOOK_URL'
  | 'WEBHOOK_SECRET'
>