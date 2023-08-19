import { GetUserCasesResolvedDailyDto } from "@/metrics/dto/get-user-cases-resolved-daily.dto";
import { GetUserWorkflowProcessingStatisticDto } from "@/metrics/dto/get-user-workflow-processing-statistic.dto";
import { GetUsersAssignedCasesStatisticDto } from "@/metrics/dto/get-users-assigned-cases-statistic.dto";
import { GetUsersResolvedCasesStatisticDto } from "@/metrics/dto/get-users-resolved-cases-statistic.dto";
import { GetWorkflowRuntimesStatusCountDto } from "@/metrics/dto/get-workflow-runtimes-status-count.dto";
import { MetricsService } from "@/metrics/service/metrics.service";
import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { db } from "@/db/client";
import { MetricsRepository } from "./repository/metrics.repository";
import { plainToClass } from "class-transformer";

export const metricsController: FastifyPluginAsyncTypebox = async (fastify) => {
  const metricsRepository = new MetricsRepository(
    db
  );
  const metricsService = new MetricsService(metricsRepository);

  // getRuntimesStatistic
  fastify.get("/workflows/runtimes-statistic", async (_req, reply) => {
    const runtimesStatistic = await metricsService.listRuntimesStatistic();

    return reply.send(runtimesStatistic);
  });

  // getRuntimesStatusCount
  fastify.get("/workflows/runtimes-status-count", async (req, reply) => {
    const query = plainToClass(GetWorkflowRuntimesStatusCountDto, req.query);
    const runtimesStatusCount = await metricsService.getRuntimesStatusCaseCount(query);

    return reply.send(runtimesStatusCount);
  });

  // getUsersAssignedCasesStatistic
  fastify.get("/users/users-assigned-cases-statistic", async (req, reply) => {
    const query = plainToClass(GetUsersAssignedCasesStatisticDto, req.query);
    const usersAssignedCasesStatistic = await metricsService.listUsersAssignedCasesStatistic(query);

    return reply.send(usersAssignedCasesStatistic);
  });


  // getUsersResolvedCasesStatistic
  fastify.get("/users/users-resolved-cases-statistic", async (req, reply) => {
    const query = plainToClass(GetUsersResolvedCasesStatisticDto, req.query);
    const usersResolvedCasesStatistic = await metricsService.getUserWorkflowProcessingStatistic({
      fromDate: query.fromDate
    });

    return reply.send(usersResolvedCasesStatistic);
  });


  // getUserWorkflowProcessingStatistic
  fastify.get("/users/workflow-processing-statistic", async (req, reply) => {
    const query = plainToClass(GetUserWorkflowProcessingStatisticDto, req.query);
    const userWorkflowProcessingStatistic = await metricsService.getUserWorkflowProcessingStatistic({
      fromDate: query.fromDate,
    });

    return reply.send(userWorkflowProcessingStatistic);
  });

  // getUserCasesResolvedDaily
  fastify.get("/users/cases-resolved-daily", async (req, reply) => {
    const query = plainToClass(GetUserCasesResolvedDailyDto, req.query);
    const userCasesResolvedDaily = await metricsService.listUserCasesResolvedDaily({
      fromDate: query.fromDate,
      userId: query.userId
    });

    return reply.send(userCasesResolvedDaily);
  });


  // getActiveUsers
  fastify.get("/users", async (_req, reply) => {
    const activeUsers = await metricsService.listActiveUsers();

    return reply.send(activeUsers);
  });
};