import { InternalServerErrorSchema } from "@/common/schemas/http-schemas";
import { Type } from "@sinclair/typebox";
import { DateQueryParamsDto } from "@/metrics/common/dto/date-query-params.dto";

export const UsersWorkflowProcessingStatisticRouteSchema = {
  description: "Get user workflow processing statistic.",
  tags: ["Metrics"],
  querystring: DateQueryParamsDto,
  response: {
    200: Type.Object({
      id: Type.String(),
      approvalRate: Type.String(),
      averageResolutionTime: Type.String({ description: "Average resolution time in milliseconds" }),
      averageAssignmentTime: Type.String({ description: "Average assignment time in milliseconds" }),
      averageReviewTime: Type.String({ description: "Average review time in milliseconds" })
    }),
    500: InternalServerErrorSchema
  }
};