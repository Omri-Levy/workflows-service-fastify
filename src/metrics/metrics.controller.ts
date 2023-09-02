import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { usersRoute } from "@/metrics/users/users.route";
import { usersCasesResolvedDailyRoute } from "@/metrics/users-cases-resolved-daily/users-cases-resolved-daily.route";
import {
  usersWorkflowProcessingStatisticRoute
} from "@/metrics/users-workflow-processing-statistic/users-workflow-processing-statistic.route";
import {
  usersResolvedCasesStatisticRoute
} from "@/metrics/users-resolved-cases-statistic/users-resolved-cases-statistic.route";
import {
  usersAssignedCasesStatisticRoute
} from "@/metrics/users-assigned-cases-statistic/users-users-assigned-cases-statistic.route";
import {
  workflowsRuntimesStatusCountRoute
} from "@/metrics/workflows-runtimes-status-count/workflows-runtimes-status-count.route";
import {
  workflowsRuntimesStatisticRoute
} from "@/metrics/workflows-runtimes-statistic/workflows-runtimes-statistic.route";

export const metricsController: FastifyPluginAsyncTypebox = async (fastify) => {

  await fastify.register(workflowsRuntimesStatisticRoute);
  await fastify.register(workflowsRuntimesStatusCountRoute);
  await fastify.register(usersAssignedCasesStatisticRoute);
  await fastify.register(usersResolvedCasesStatisticRoute);
  await fastify.register(usersWorkflowProcessingStatisticRoute);
  await fastify.register(usersCasesResolvedDailyRoute);
  await fastify.register(usersRoute);

};