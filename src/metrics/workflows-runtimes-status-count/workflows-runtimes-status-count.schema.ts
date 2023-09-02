import { BadRequestSchema, InternalServerErrorSchema, UnauthorizedSchema } from "@/common/schemas/http-schemas";
import { Type } from "@sinclair/typebox";
import { DateQueryParamsDto } from "@/metrics/common/dto/date-query-params.dto";

export const WorkflowsRuntimesStatusCountRouteSchema = {
  description: "Get runtimes status count for workflows.",
  tags: ["Metrics"],
  querystring: DateQueryParamsDto,
  response: {
    200: Type.Object({
      active: Type.Number(),
      completed: Type.Number(),
      failed: Type.Number(),
    }),
    400: BadRequestSchema,
    401: UnauthorizedSchema,
    500: InternalServerErrorSchema
  }
};