import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import {
  listWorkflowsRouteExternal
} from "@/workflow/external/list-workflow-runtime-data/list-workflow-runtime-data.route";
import {
  getWorkflowDefinitionByIdRouteExternal
} from "@/workflow/external/get-workflow-definition-by-id/get-workflow-definition-by-id.route";
import {
  getRunnableWorkflowByIdRouteExternal
} from "@/workflow/external/get-runnable-workflow-by-id/get-runnable-workflow-by-id.route";
import {
  updateWorkflowRuntimeDataByIdRouteExternal
} from "@/workflow/external/update-workflow-runtime-data-by-id/update-workflow-runtime-data-by-id.route";
import { intentRouteExternal } from "@/workflow/external/intent/intent.route";
import { runRouteExternal } from "@/workflow/external/run/run.route";
import { eventRouteExternal } from "@/workflow/external/event/event.route";
import { sendEventRouteExternal } from "@/workflow/external/send-event/send-event.route";
import { getContextByIdRouteExternal } from "@/workflow/external/get-context-by-id/get-context-by-id.route";

export const workflowControllerExternal: FastifyPluginAsyncTypebox = async (fastify) => {

  await fastify.register(listWorkflowsRouteExternal);
  await fastify.register(getWorkflowDefinitionByIdRouteExternal);
  await fastify.register(getRunnableWorkflowByIdRouteExternal);
  await fastify.register(updateWorkflowRuntimeDataByIdRouteExternal);
  await fastify.register(intentRouteExternal);
  await fastify.register(runRouteExternal);
  await fastify.register(eventRouteExternal);
  await fastify.register(sendEventRouteExternal);
  await fastify.register(getContextByIdRouteExternal);

};