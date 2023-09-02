import { InternalServerErrorSchema, UnauthorizedSchema } from "@/common/schemas/http-schemas";
import { Type } from "@sinclair/typebox";
import { MetricsUserModelSchema } from "@/metrics/repository/models/metrics-user.model";

export const UsersRouteSchema = {
  description: "List active users.",
  tags: ["Metrics"],
  response: {
    200: Type.Array(MetricsUserModelSchema),
    401: UnauthorizedSchema,
    500: InternalServerErrorSchema
  }
};