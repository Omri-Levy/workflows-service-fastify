/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { WorkflowEventEmitterService } from '@/workflow/workflow-event-emitter.service';
import { AxiosInstance } from 'axios';
import { alertWebhookFailure } from '@/events/alert-webhook-failure';
import { ExtractWorkflowEventData } from '@/workflow/types';
import { getWebhookInfo } from '@/events/get-webhook-info';
import { logger } from "@/lib/logging/logger";
import { HttpService } from '@/http/http.service';
import { TWebhookConfig } from "@/events/types";

export class WorkflowStateChangedWebhookCaller {
  #__axios: AxiosInstance;

  constructor(
    private httpService: HttpService,
    private workflowEventEmitter: WorkflowEventEmitterService,
    private config: TWebhookConfig,
  ) {
    this.#__axios = this.httpService.axiosRef;

    workflowEventEmitter.on('workflow.state.changed', async data => {
      try {
        await this.handleWorkflowEvent(data);
      } catch (error) {
        console.error(error);
        alertWebhookFailure(error);
      }
    });
  }

  async handleWorkflowEvent(data: ExtractWorkflowEventData<'workflow.state.changed'>) {
    logger.info('handleWorkflowEvent:: ', {
      state: data.state,
      entityId: data.entityId,
      correlationId: data.correlationId,
      id: data.runtimeData.id,
    });

    const { id, environment, url, authSecret, apiVersion } = getWebhookInfo(
      data.runtimeData.config,
      this.config.NODE_ENV,
      this.config.WEBHOOK_URL,
      this.config.WEBHOOK_SECRET,
      'workflow.state.changed',
    );

    if (!url) {
      logger.info(`No webhook url found for a workflow runtime data with an id of "${id}"`);
      return;
    }

    logger.info('Sending webhook', { id, url });

    try {
      const res = await this.#__axios.post(
        url,
        {
          id,
          eventName: 'workflow.state.changed',
          state: data.state,
          apiVersion,
          timestamp: new Date().toISOString(),
          workflowCreatedAt: data.runtimeData.createdAt,
          workflowResolvedAt: data.runtimeData.resolvedAt,
          workflowDefinitionId: data.runtimeData.workflowDefinitionId,
          workflowRuntimeId: data.runtimeData.id,
          ballerineEntityId: data.entityId,
          correlationId: data.correlationId,
          environment,
          data: data.runtimeData.context,
        },
        {
          headers: {
            'X-Authorization': authSecret,
          },
        },
      );

      logger.info('Webhook Result:', {
        status: res.status,
        statusText: res.statusText,
        data: res.data,
      });
    } catch (error: Error | any) {
      logger.info('Webhook error data::  ', {
        state: data.state,
        entityId: data.entityId,
        correlationId: data.correlationId,
        id: data.runtimeData.id,
      });
      logger.error('Failed to send webhook', { id, message: error?.message, error });
      alertWebhookFailure(error);
    }
  }
}
