import { InternalServerErrorSchema } from "@/common/schemas/http-schemas";
import { DateQueryParamsDto } from "@/metrics/common/dto/date-query-params.dto";
import { Type } from "@sinclair/typebox";

export const UsersResolvedCasesStatisticRouteSchema = {
  description: "Get statistics of resolved cases by users.",
  tags: ["Metrics"],
  querystring: DateQueryParamsDto,
  response: {
    200: Type.Object({
      id: Type.String(),
      approvalRate: Type.String(),
      averageResolutionTime: Type.String({ description: 'Average resolution time in milliseconds' }),
      averageAssignmentTime: Type.String({ description: 'Average assignment time in milliseconds' }),
      averageReviewTime: Type.String({ description: 'Average review time in milliseconds' })
    }),
    500: InternalServerErrorSchema
  }
};