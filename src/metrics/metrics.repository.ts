import { WorkflowRuntimeStatisticModel } from "@/metrics/repository/models/workflow-runtime-statistic.model";
import { IAggregateWorkflowRuntimeStatistic } from "@/metrics/repository/types/aggregate-workflow-runtime-statistic";
import { Db } from "@/db/client";
import { plainToClass } from "class-transformer";
import { IAggregateUsersWithCasesCount } from "@/metrics/repository/types/aggregate-users-with-cases-count";
import {
  WorkflowRuntimeStatusCaseCountModel
} from "@/metrics/repository/models/workflow-runtime-status-case-count.model";
import { aggregateWorkflowRuntimeStatisticQuery } from "./repository/sql/aggregate-workflow-runtime-statistic.sql";
import { aggregateWorkflowRuntimeStatusCaseCountQuery } from "./repository/sql/aggregate-workflow-runtime-status-case-count.sql";
import {
  IAggregateWorkflowRuntimeStatusCaseCount
} from "@/metrics/repository/types/aggregate-workflow-runtime-status-case-count";
import { GetRuntimeStatusCaseCountParams } from "@/metrics/repository/types/get-runtime-status-case-count.params";
import { GetUserApprovalRateParams } from "@/metrics/repository/types/get-user-approval-rate.params";
import { ApprovalRateModel } from "@/metrics/repository/models/approval-rate.model";
import { IAggregateApprovalRate } from "@/metrics/repository/types/aggregate-approval-rate";
import { GetUserAverageResolutionTimeParams } from "@/metrics/repository/types/get-user-average-resolution-time.params";
import { AverageResolutionTimeModel } from "@/metrics/repository/models/average-resolution-time.model";
import { aggregateAverageResolutionTimeQuery } from "./repository/sql/aggregate-average-resolution-time.sql";
import { IAggregateAverageResolutionTime } from "@/metrics/repository/types/aggregate-average-resolution-time";
import { GetUserAverageAssignmentTimeParams } from "@/metrics/repository/types/get-user-average-assignment-time.params";
import { IAggregateAverageAssignmentTime } from "@/metrics/repository/types/aggregate-average-assignment-time";
import { GetUserAverageReviewTimeParams } from "@/metrics/repository/types/get-user-average-review-time.params";
import { AverageReviewTimeModel } from "@/metrics/repository/models/average-review-time.model";
import { IAggregateAverageReviewTime } from "@/metrics/repository/types/aggregate-average-review-time";
import { ListUserCasesResolvedDailyParams } from "@/metrics/repository/types/list-user-cases-resolved-daily.params";
import { CasesResolvedInDay } from "@/metrics/repository/models/cases-resolved-daily.model";
import { IAggregateCasesResolvedDaily } from "@/metrics/repository/types/aggregate-cases-resolved-daily";
import { aggregateDailyCasesResolvedQuery } from "@/metrics/repository/sql/aggregate-daily-cases-resolved.sql";
import { ISelectActiveUser } from "@/metrics/repository/types/select-active-user";
import { selectActiveUsersQuery } from "@/metrics/repository/sql/select-active-users.sql";
import {
  FindUsersAssignedCasesStatisticParams
} from "@/metrics/repository/types/find-users-assigned-cases-statistic.params";
import { UserAssignedCasesStatisticModel } from "@/metrics/repository/models/user-assigned-cases-statistic.model";
import {
  aggregateUsersAssignedCasesStatisticQuery
} from "@/metrics/repository/sql/aggregate-users-assigned-cases-statistic.sql";
import {
  FindUsersResolvedCasesStatisticParams
} from "@/metrics/repository/types/find-users-resolved-cases-statistic.params";
import { UserResolvedCasesStatisticModel } from "@/metrics/repository/models/user-resolved-cases-statistic.model";
import {
  IAggregateUserResolvedCasesStatistic
} from "@/metrics/repository/types/aggregate-user-resolved-cases-statistic";
import {
  aggregateUsersResolvedCasesStatisticQuery
} from "@/metrics/repository/sql/aggregate-users-resolved-cases-statistic.sql";
import { aggregateApprovalRateQuery } from "@/metrics/repository/sql/aggregate-approval-rate.sql";
import { aggregateAverageAssignmentTimeQuery } from "@/metrics/repository/sql/aggregate-average-assignment-time.sql";
import { AverageAssignmentTimeModel } from "@/metrics/repository/models/average-assignment-time.model";
import { aggregateAverageReviewTimeQuery } from "@/metrics/repository/sql/aggregate-average-review-time.sql";

export class MetricsRepository {
  constructor(private readonly db: Db) {
  }

  async getRuntimeStatusCaseCount(
    params: GetRuntimeStatusCaseCountParams
  ): Promise<WorkflowRuntimeStatusCaseCountModel> {
    const results = await this.db.$queryRawUnsafe<
      IAggregateWorkflowRuntimeStatusCaseCount[]
    >(aggregateWorkflowRuntimeStatusCaseCountQuery, params.fromDate);

    return plainToClass(
      WorkflowRuntimeStatusCaseCountModel,
      results.length ? results.at(-1) : { active: 0, failed: 0, completed: 0 }
    );
  }

  async findRuntimeStatistic(): Promise<WorkflowRuntimeStatisticModel[]> {
    const results = await this.db.$queryRawUnsafe<IAggregateWorkflowRuntimeStatistic[]>(
      aggregateWorkflowRuntimeStatisticQuery
    );

    return results.map(result =>
      plainToClass(WorkflowRuntimeStatisticModel, {
        id: result.workflowDefinitionId,
        name: result.workflowDefinitionName,
        active: result.active || 0,
        completed: result.completed || 0,
        failed: result.failed
      })
    );
  }

  async findUsersAssignedCasesStatistic(
    params: FindUsersAssignedCasesStatisticParams
  ): Promise<UserAssignedCasesStatisticModel[]> {
    const results = await this.db.$queryRawUnsafe<IAggregateUsersWithCasesCount[]>(
      aggregateUsersAssignedCasesStatisticQuery,
      params.fromDate
    );

    return results.map(result => plainToClass(UserAssignedCasesStatisticModel, result));
  }

  async findUsersResolvedCasesStatistic(
    params: FindUsersResolvedCasesStatisticParams
  ): Promise<UserResolvedCasesStatisticModel[]> {
    const results = await this.db.$queryRawUnsafe<
      IAggregateUserResolvedCasesStatistic[]
    >(aggregateUsersResolvedCasesStatisticQuery, params.fromDate);

    return results.map(result =>
      plainToClass(UserResolvedCasesStatisticModel, {
        id: result.id,
        firstName: result.firstName,
        lastName: result.lastName,
        casesCount: result.casesCount,
        email: result.email
      })
    );
  }

  async getUserApprovalRate(params: GetUserApprovalRateParams): Promise<ApprovalRateModel | null> {
    const results = await this.db.$queryRawUnsafe<IAggregateApprovalRate[]>(
      aggregateApprovalRateQuery,
      params.fromDate
    );

    return results.length
      ? plainToClass(ApprovalRateModel, { approvalRate: results.at(-1)?.approvalRate })
      : null;
  }

  async getUserAverageResolutionTime(
    params: GetUserAverageResolutionTimeParams
  ): Promise<AverageResolutionTimeModel | null> {
    const results = await this.db.$queryRawUnsafe<IAggregateAverageResolutionTime[]>(
      aggregateAverageResolutionTimeQuery,
      params.fromDate
    );

    return results.length
      ? plainToClass(AverageResolutionTimeModel, { time: results.at(-1)?.average_time })
      : null;
  }

  async getUserAverageAssignmentTime(
    params: GetUserAverageAssignmentTimeParams
  ): Promise<AverageAssignmentTimeModel | null> {
    const results = await this.db.$queryRawUnsafe<IAggregateAverageAssignmentTime[]>(
      aggregateAverageAssignmentTimeQuery,
      params.fromDate
    );

    return results.length
      ? plainToClass(AverageAssignmentTimeModel, { time: results.at(-1)?.average_time })
      : null;
  }

  async getUserAverageReviewTime(
    params: GetUserAverageReviewTimeParams
  ): Promise<AverageReviewTimeModel | null> {
    const results = await this.db.$queryRawUnsafe<IAggregateAverageReviewTime[]>(
      aggregateAverageReviewTimeQuery,
      params.fromDate
    );

    return results.length
      ? plainToClass(AverageReviewTimeModel, { time: results.at(-1)?.average_time })
      : null;
  }

  async listCasesResolvedDaily(
    params: ListUserCasesResolvedDailyParams
  ): Promise<CasesResolvedInDay[]> {
    const results = await this.db.$queryRawUnsafe<IAggregateCasesResolvedDaily[]>(
      aggregateDailyCasesResolvedQuery,
      params.fromDate,
      params.userId
    );

    if (!results.length) return [];

    return results.map(result =>
      plainToClass(CasesResolvedInDay, {
        date: result.date,
        count: result.cases
      })
    );
  }

  async listUsers() {
    const results = await this.db.$queryRawUnsafe<ISelectActiveUser[]>(
      selectActiveUsersQuery
    );

    return results;
  }
}
