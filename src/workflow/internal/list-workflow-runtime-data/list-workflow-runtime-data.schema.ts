import { FindWorkflowsListSchema } from "@/workflow/dtos/find-workflows-list.dto";
import { typeboxBuilder } from "@/common/utils/typebox-builder/typebox-builder";
import { WorkflowRuntimeDataStatusSchema } from "@/workflow/workflow-runtime-data-status.schema";
import { TypeDateString, TypeNullable } from "@/common/schemas/schemas";
import { BadRequestSchema, InternalServerErrorSchema, UnauthorizedSchema } from "@/common/schemas/http-schemas";
import { Type } from "@sinclair/typebox";
import { ListWorkflowRuntimeDataWithRelationsReturnType } from "@/workflow/types";

export const ListWorkflowRuntimeDataRouteInternalSchema = {
  description: "Fetches a list of workflow runtime data",
  tags: ["Internal", "Workflow"],
  querystring: FindWorkflowsListSchema,
  response: {
    200: typeboxBuilder<ListWorkflowRuntimeDataWithRelationsReturnType>()(
      Type.Object({
        data: typeboxBuilder<ListWorkflowRuntimeDataWithRelationsReturnType["data"]>()(
          Type.Array(
            Type.Object({
              id: Type.String(),
              status: WorkflowRuntimeDataStatusSchema,
              createdAt: TypeDateString,
              entity: Type.Object({
                id: Type.Optional(Type.String()),
                name: Type.Optional(Type.String()),
                avatarUrl: Type.Optional(
                  TypeNullable(
                    Type.String()
                  )
                )
              }),
              assignee: TypeNullable(
                Type.Object({
                  id: Type.Optional(Type.String()),
                  firstName: Type.Optional(Type.String()),
                  lastName: Type.Optional(Type.String())
                })
              )
            })
          )
        ),
        meta: Type.Object({
          totalItems: Type.Number(),
          totalPages: Type.Number()
        })
      })),
    400: BadRequestSchema,
    404: UnauthorizedSchema,
    500: InternalServerErrorSchema
  }
};