import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import {
  listWorkflowRuntimeDataRouteInternal
} from "@/workflow/internal/list-workflow-runtime-data/list-workflow-runtime-data.route";
import {
  createWorkflowDefinitionRouteInternal
} from "@/workflow/internal/create-workflow-definition/create-workflow-definition.route";
import {
  getRunnableWorkflowByIdRouteInternal
} from "@/workflow/internal/get-runnable-workflow-by-id/get-runnable-workflow-by-id.route";
import { listActiveStatesRouteInternal } from "@/workflow/internal/list-active-states/list-active-states.route";
import { eventRouteInternal } from "@/workflow/internal/event/event.route";
import {
  updateWorkflowRuntimeDataRouteInternal
} from "@/workflow/internal/update-workflow-runtime-data-by-id/update-workflow-runtime-data-by-id.route";
import {
  deleteWorkflowDefinitionRouteInternal
} from "@/workflow/internal/delete-workflow-definition-by-id/delete-workflow-definition-by-id.route";
import { assignWorkflowByIdRouteInternal } from "@/workflow/internal/assign-workflow-by-id/assign-workflow-by-id.route";

export const workflowControllerInternal: FastifyPluginAsyncTypebox = async (fastify) => {

  await fastify.register(createWorkflowDefinitionRouteInternal);
  await fastify.register(listWorkflowRuntimeDataRouteInternal);
  await fastify.register(getRunnableWorkflowByIdRouteInternal);
  await fastify.register(listActiveStatesRouteInternal);
  await fastify.register(eventRouteInternal);
  await fastify.register(updateWorkflowRuntimeDataRouteInternal);
  await fastify.register(deleteWorkflowDefinitionRouteInternal);
  await fastify.register(assignWorkflowByIdRouteInternal);

};