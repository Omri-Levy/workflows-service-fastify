import { BadRequestSchema, InternalServerErrorSchema, UnauthorizedSchema } from "@/common/schemas/http-schemas";
import { Type } from "@sinclair/typebox";

export const WorkflowsRuntimesStatisticRouteSchema = {
  description: "Get runtimes statistic for workflows.",
  tags: ["Metrics"],
  response: {
    200: Type.Array(
      Type.Object({
        id: Type.String({ description: "Workflow Runtime Definition Id" }),
        name: Type.String({ description: "Workflow Runtime Definition name" }),
        active: Type.Number(),
        failed: Type.Number(),
        completed: Type.Number()
      })
    ),
    400: BadRequestSchema,
    401: UnauthorizedSchema,
    500: InternalServerErrorSchema
  }
};