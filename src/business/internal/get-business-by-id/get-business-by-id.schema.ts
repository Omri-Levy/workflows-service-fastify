import {
  BadRequestSchema,
  InternalServerErrorSchema,
  NotFoundSchema,
  UnauthorizedSchema
} from "@/common/schemas/http-schemas";
import { BusinessSchema } from "@/business/business.schema";
import { Type } from "@sinclair/typebox";

export const GetBusinessByIdRouteInternalSchema = {
  description: "Retrieve a business by its unique ID",
  tags: ["Internal", "Business"],
  params: Type.Object({
    id: Type.String({ description: "Unique ID of the business" })
  }),
  response: {
    200: Type.Omit(BusinessSchema, ["endUsersOnBusinesses", "workflowRuntimeData", "endUsers"]),
    400: BadRequestSchema,
    401: UnauthorizedSchema,
    404: NotFoundSchema,
    500: InternalServerErrorSchema
  }
};