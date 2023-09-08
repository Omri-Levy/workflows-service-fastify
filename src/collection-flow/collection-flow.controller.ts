import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { authorizeUserRoute } from "@/collection-flow/authorize-user/authorize-user.route";
import {
  updateFlowConfigurationRoute
} from "@/collection-flow/update-flow-configuration/update-flow-configuration.route";
import { getActiveFlowRoute } from "@/collection-flow/get-active-flow/get-active-flow.route";
import { finishFlowRoute } from "@/collection-flow/finish-flow/finish-flow.route";
import { getFlowConfigurationRoute } from "@/collection-flow/get-flow-configuration/get-flow-configuration.route";
import { resubmitFlowRoute } from "@/collection-flow/resubmit-flow/resubmit-flow.route";
import { updateFlowRoute } from "@/collection-flow/update-flow/update-flow.route";

export const collectionFlowController: FastifyPluginAsyncTypebox = async (fastify) => {

  await fastify.register(authorizeUserRoute);
  await fastify.register(getActiveFlowRoute);
  await fastify.register(getFlowConfigurationRoute);
  await fastify.register(updateFlowConfigurationRoute);
  await fastify.register(getActiveFlowRoute);
  await fastify.register(updateFlowRoute);
  await fastify.register(finishFlowRoute);
  await fastify.register(resubmitFlowRoute);

};
