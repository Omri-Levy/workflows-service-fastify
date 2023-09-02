import { InternalServerErrorSchema } from "@/common/schemas/http-schemas";
import { Type } from "@sinclair/typebox";
import { GetUserCasesResolvedDailyDto } from "@/metrics/dto/get-user-cases-resolved-daily.dto";

export const UsersCasesResolvedDailyRouteSchema = {
  description: "List cases resolved daily by user.",
  tags: ["Metrics"],
  querystring: GetUserCasesResolvedDailyDto,
  response: {
    200: Type.Array(
      Type.Object({
        count: Type.Number(),
        date: Type.String()
      })
    ),
    500: InternalServerErrorSchema
  }
};