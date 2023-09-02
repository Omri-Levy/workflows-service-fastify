import { InternalServerErrorSchema } from "@/common/schemas/http-schemas";
import { Type } from "@sinclair/typebox";
import { DateQueryParamsDto } from "@/metrics/common/dto/date-query-params.dto";

export const UsersAssignedCasesStatisticRouteSchema = {
  description: "Get statistics of cases assigned to users.",
  tags: ["Metrics"],
  querystring: DateQueryParamsDto,
  response: {
    200: Type.Array(
      Type.Object({
        id: Type.String(),
        firstName: Type.String(),
        lastName: Type.String(),
        email: Type.String(),
        casesCount: Type.Number()
      })
    ),
    500: InternalServerErrorSchema
  }
};