import { DateQueryParamsDto } from "@/metrics/common/dto/date-query-params.dto";
import { Type } from "@sinclair/typebox";

export const GetUserCasesResolvedDailyDto = Type.Composite([
  DateQueryParamsDto,
  Type.Object({
    userId: Type.String()
  })
]);
