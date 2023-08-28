/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { WorkflowEventEmitterService } from "@/workflow/workflow-event-emitter.service";
import { AxiosInstance } from "axios";
import { getDocumentId } from "@ballerine/common";
import { alertWebhookFailure } from "@/events/alert-webhook-failure";
import { ExtractWorkflowEventData } from "@/workflow/types";
import { getWebhookInfo } from "@/events/get-webhook-info";
import { logger } from "@/lib/logging/logger";
import { HttpService } from "@/http/http.service";
import { TWebhookConfig } from "@/events/types";

export class DocumentChangedWebhookCaller {
  #__axios: AxiosInstance;

  constructor(
    private httpService: HttpService,
    private workflowEventEmitter: WorkflowEventEmitterService,
    private readonly config: TWebhookConfig,
  ) {
    this.#__axios = this.httpService.axiosRef;

    workflowEventEmitter.on("workflow.context.changed", async data => {
      try {
        await this.handleWorkflowEvent(data);
      } catch (error) {
        console.error(error);
        alertWebhookFailure(error);
      }
    });
  }

  async handleWorkflowEvent(data: ExtractWorkflowEventData<"workflow.context.changed">) {
    const oldDocuments = data.oldRuntimeData.context["documents"] || [];
    const newDocuments = data.updatedRuntimeData.context?.["documents"] || [];

    logger.info("handleWorkflowEvent:: ", {
      state: data.state,
      entityId: data.entityId,
      correlationId: data.correlationId,
      id: data.updatedRuntimeData.id
    });

    const newDocumentsByIdentifier = newDocuments.reduce((accumulator: any, doc: any) => {
      const id = getDocumentId(doc, false);
      logger.info("handleWorkflowEvent::newDocumentsByIdentifier::getDocumentId::  ", {
        idDoc: id
      });
      accumulator[id] = doc;
      return accumulator;
    }, {});

    const anyDocumentStatusChanged = oldDocuments.some((oldDocument: any) => {
      const id = getDocumentId(oldDocument, false);
      logger.info("handleWorkflowEvent::anyDocumentStatusChanged::getDocumentId::  ", {
        idDoc: id
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
      logger.info("handleWorkflowEvent:: Skipped, ", {
        anyDocumentStatusChanged
      });
      return;
    }

    const { id, environment, url, authSecret, apiVersion } = getWebhookInfo(
      data.updatedRuntimeData.config,
      this.config.NODE_ENV,
      this.config.WEBHOOK_URL,
      this.config.WEBHOOK_SECRET,
      "workflow.context.document.changed"
    );

    if (!url) {
      logger.info(`No webhook url found for a workflow runtime data with an id of "${id}"`);
      return;
    }

    data.updatedRuntimeData.context.documents.forEach((doc: any) => {
      delete doc.propertiesSchema;
    });

    logger.info("Sending webhook", { id, url });

    try {
      const res = await this.#__axios.post(
        url,
        {
          id,
          eventName: "workflow.context.document.changed",
          apiVersion,
          timestamp: new Date().toISOString(),
          workflowCreatedAt: data.updatedRuntimeData.createdAt,
          workflowResolvedAt: data.updatedRuntimeData.resolvedAt,
          workflowDefinitionId: data.updatedRuntimeData.workflowDefinitionId,
          workflowRuntimeId: data.updatedRuntimeData.id,
          ballerineEntityId: data.entityId,
          correlationId: data.correlationId,
          environment,
          data: data.updatedRuntimeData.context
        },
        {
          headers: {
            "X-Authorization": authSecret
          }
        }
      );

      logger.info("Webhook Result:", {
        status: res.status,
        statusText: res.statusText,
        data: res.data
      });
    } catch (error: Error | any) {
      logger.info("Webhook error data::  ", {
        state: data.state,
        entityId: data.entityId,
        correlationId: data.correlationId,
        id: data.updatedRuntimeData.id,
        newDocumentsByIdentifier,
        oldDocuments
      });
      logger.error("Failed to send webhook", { id, message: error?.message, error });
      alertWebhookFailure(error);
    }
  }
}
