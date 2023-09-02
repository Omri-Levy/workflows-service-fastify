import { BusinessSchema } from "@/business/business.schema";
import { BadRequestSchema, InternalServerErrorSchema, UnauthorizedSchema } from "@/common/schemas/http-schemas";
import { Type } from "@sinclair/typebox";

export const GetBusinessByIdRouteExternalSchema = {
  description: "Retrieve a business by its unique ID",
  tags: ["External", "Business"],
  params: Type.Object({
    id: Type.String({ description: "Unique ID of the business" })
  }),
  response: {
    200: Type.Omit(BusinessSchema, ["endUsersOnBusinesses", "workflowRuntimeData", "endUsers"]),
    400: BadRequestSchema,
    401: UnauthorizedSchema,
    500: InternalServerErrorSchema
  }
};