import { Type } from "@sinclair/typebox";

export const DateQueryParamsDto = Type.Object({
  fromDate: Type.Transform(Type.Number({
    description: "UNIX timestamp"
  }))
    .Decode((value) => new Date(value ? +value : 0))
    .Encode((value) => value.getTime())
});
