import {
  BadRequestSchema,
  InternalServerErrorSchema,
  NotFoundSchema,
  UnauthorizedSchema
} from "@/common/schemas/http-schemas";
import { WorkflowRuntimeDataSchema } from "@/workflow/workflow-runtime-data.schema";
import { Type } from "@sinclair/typebox";

export const GetContextByIdRouteExternalSchema = {
  description: "Retrieve the context object of a workflow by the workflow's unique ID",
  tags: ["External", "Workflows"],
  params: Type.Object({
    id: Type.String({ description: "ID of the workflow" })
  }),
  response: {
    200: Type.Pick(WorkflowRuntimeDataSchema, ["context"]),
    400: BadRequestSchema,
    404: NotFoundSchema,
    401: UnauthorizedSchema,
    500: InternalServerErrorSchema
  }
};