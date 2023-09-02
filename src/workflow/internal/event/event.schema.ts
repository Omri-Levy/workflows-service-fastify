import { typeboxBuilder } from "@/common/utils/typebox-builder/typebox-builder";
import { BadRequestSchema, InternalServerErrorSchema, UnauthorizedSchema } from "@/common/schemas/http-schemas";
import { ResubmissionReason, TResubmissionReason } from "@/workflow/workflow.service";
import { Type } from "@sinclair/typebox";

export const EventRouteInternalSchema = {
  description: "Send an event to the workflow with a payload",
  tags: ["Internal", "Workflows"],
  params: Type.Object({
    id: Type.String({ description: "ID of the workflow" })
  }),
  body: Type.Object({
    name: Type.String(),
    document: Type.Optional(Type.String({
      description: "Which document requires re-submission - only required for re-submission"
    })),
    resubmissionReason: typeboxBuilder<TResubmissionReason>()(
      Type.Optional(
        Type.Union([
          Type.Literal(ResubmissionReason.BLURRY_IMAGE),
          Type.Literal(ResubmissionReason.CUT_IMAGE),
          Type.Literal(ResubmissionReason.UNSUPPORTED_DOCUMENT),
          Type.Literal(ResubmissionReason.DAMAGED_DOCUMENT),
          Type.Literal(ResubmissionReason.EXPIRED_DOCUMENT),
          Type.Literal(ResubmissionReason.COPY_OF_A_COPY),
          Type.Literal(ResubmissionReason.FACE_IS_UNCLEAR),
          Type.Literal(ResubmissionReason.FACE_IS_NOT_MATCHING)
        ], {
          description: "Only required for re-submission"
        })
      )
    )
  }, {
    additionalProperties: false
  }),
  response: {
    200: {
      type: "null",
      description: "Event sent successfully"
    },
    400: BadRequestSchema,
    401: UnauthorizedSchema,
    500: InternalServerErrorSchema
  }
};