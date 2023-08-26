/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import {
  WorkflowEventEmitterService,
  WorkflowEventRawData,
} from '@/workflow/workflow-event-emitter.service';
import { randomUUID } from 'crypto';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/node';
import { AxiosInstance, isAxiosError } from 'axios';
import { WorkflowConfig } from '@/workflow/schemas/zod-schemas';
import { getDocumentId } from '@ballerine/common';
import { logger } from '@/lib/logging/logger';

export class DocumentChangedWebhookCaller {
  #__axios: AxiosInstance;

  constructor(
    private httpService: HttpService,
    private workflowEventEmitter: WorkflowEventEmitterService,
    private configService: ConfigService,
  ) {
    this.#__axios = this.httpService.axiosRef;

    workflowEventEmitter.on('workflow.context.changed', async data => {
      try {
        await this.handleWorkflowEvent(data);
      } catch (error) {
        console.error(error);
        alertWebhookFailure(error);
      }
    });
  }

  async handleWorkflowEvent(data: WorkflowEventRawData) {
    const oldDocuments = data.oldRuntimeData.context['documents'] || [];
    const newDocuments = data.updatedRuntimeData.context?.['documents'] || [];

    logger.info('handleWorkflowEvent:: ', {
      state: data.state,
      entityId: data.entityId,
      correlationId: data.correlationId,
      id: data.updatedRuntimeData.id,
    });

    const newDocumentsByIdentifier = newDocuments.reduce((accumulator: any, doc: any) => {
      const id = getDocumentId(doc, false);
      logger.info('handleWorkflowEvent::newDocumentsByIdentifier::getDocumentId::  ', {
        idDoc: id,
      });
      accumulator[id] = doc;
      return accumulator;
    }, {});

    const anyDocumentStatusChanged = oldDocuments.some((oldDocument: any) => {
      const id = getDocumentId(oldDocument, false);
      logger.info('handleWorkflowEvent::anyDocumentStatusChanged::getDocumentId::  ', {
        idDoc: id,
      });
      return (
        (!oldDocument.decision && newDocumentsByIdentifier[id]?.decision) ||
        (oldDocument.decision &&
          oldDocument.decision.status &&
          id in newDocumentsByIdentifier &&
          oldDocument.decision.status !== newDocumentsByIdentifier[id].decision?.status)
      );
    });

    if (!anyDocumentStatusChanged) {
      logger.info('handleWorkflowEvent:: Skipped, ', {
        anyDocumentStatusChanged,
      });
      return;
    }

    const id = randomUUID();
    const environment = this.configService.get<string>('NODE_ENV');
    const url =
      getDynamicWebhookUrl(data.updatedRuntimeData?.config) ||
      this.configService.get<string>('WEBHOOK_URL')!;
    const authSecret = this.configService.get<string>('WEBHOOK_SECRET');

    data.updatedRuntimeData.context.documents.forEach((doc: any) => {
      delete doc.propertiesSchema;
    });

    logger.info('Sending webhook', { id, url });

    try {
      const res = await this.#__axios.post(
        url,
        {
          id,
          eventName: 'workflow.context.document.changed',
          apiVersion: 1,
          timestamp: new Date().toISOString(),
          workflowCreatedAt: data.updatedRuntimeData.createdAt,
          workflowResolvedAt: data.updatedRuntimeData.resolvedAt,
          workflowDefinitionId: data.updatedRuntimeData.workflowDefinitionId,
          workflowRuntimeId: data.updatedRuntimeData.id,
          ballerineEntityId: data.entityId,
          correlationId: data.correlationId,
          environment,
          data: data.updatedRuntimeData.context,
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
      logger.error('Webhook error data::  ', {
        state: data.state,
        entityId: data.entityId,
        correlationId: data.correlationId,
        id: data.updatedRuntimeData.id,
        newDocumentsByIdentifier,
        oldDocuments,
      });
      logger.error('Failed to send webhook', { id, message: error?.message, error });
      alertWebhookFailure(error);
    }
  }
}

function alertWebhookFailure(error: unknown) {
  const errorToAlert = new Error(`Failed to send a webhook`, { cause: error });
  const context = isAxiosError(error) ? { ...error } : {};

  Sentry.captureException(errorToAlert, {
    extra: context,
  });
}

const getDynamicWebhookUrl = (config: WorkflowConfig) => {
  if (!config || !config.subscriptions) return;

  const subscription = config.subscriptions.find(sub =>
    sub.events.includes('workflow.context.document.changed'),
  );

  if (!subscription || subscription.type !== 'webhook') return;

  return subscription.url;
};
