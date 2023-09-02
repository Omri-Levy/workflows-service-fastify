import { WorkflowRuntimeDataSchema } from "@/workflow/workflow-runtime-data.schema";
import { TypeNullable } from "@/common/schemas/schemas";
import { BadRequestSchema, InternalServerErrorSchema, UnauthorizedSchema } from "@/common/schemas/http-schemas";
import { Type } from "@sinclair/typebox";
import { WorkflowRuntimeDataStatusSchema } from "@/workflow/workflow-runtime-data-status.schema";
import { SortOrderSchema } from "@/common/query-filters/sort-order";

export const ListWorkflowRuntimeDataRouteExternalSchema = {
  description: "Fetch a list of workflows",
  tags: ["External", "Workflows"],
  querystring: Type.Object({
    status: Type.Optional(Type.Array(WorkflowRuntimeDataStatusSchema)),
    page: Type.Optional(Type.Number()),
    limit: Type.Optional(Type.Number()),
    orderBy: Type.Optional(
      Type.Union(
        [
          Type.Literal("workflowDefinitionName"),
          Type.Literal("status"),
          Type.Literal("state"),
          Type.Literal("assignee"),
          Type.Literal("resolvedAt"),
          Type.Literal("createdBy"),
          Type.Literal("createdAt")
        ]
      )),
    orderDirection: Type.Optional(SortOrderSchema)
  }),
  response: {
    200: Type.Object({
      results: Type.Array(
        Type.Composite(
          [
            Type.Pick(
              WorkflowRuntimeDataSchema,
              [
                "id",
                "workflowDefinitionId",
                "status",
                "state",
                "resolvedAt",
                "createdBy",
                "createdAt",
                "updatedAt",
                "context"
              ]),
            Type.Object({
              workflowDefinitionName: TypeNullable(Type.String()),
              assignee: TypeNullable(
                Type.Pick(
                  WorkflowRuntimeDataSchema.properties.assignee,
                  ["id", "firstName", "lastName"]
                )
              )
            })
          ]
        )
      ),
      meta: Type.Object({
        pages: Type.Number(),
        total: Type.Number()
      })
    }),
    400: BadRequestSchema,
    401: UnauthorizedSchema,
    500: InternalServerErrorSchema
  }
};