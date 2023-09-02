import { BusinessSchema } from "@/business/business.schema";
import { BadRequestSchema, InternalServerErrorSchema, UnauthorizedSchema } from "@/common/schemas/http-schemas";
import { Type } from "@sinclair/typebox";

export const CreateBusinessRouteExternalSchema = {
  description: "Create a new business",
  tags: ["External", "Businesses"],
  body: Type.Object({
    companyName: Type.String(),
    registrationNumber: Type.String()
  }, {
    additionalProperties: false
  }),
  response: {
    201: Type.Pick(BusinessSchema, ["id", "companyName"]),
    400: BadRequestSchema,
    401: UnauthorizedSchema,
    500: InternalServerErrorSchema
  }
};