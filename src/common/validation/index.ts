import { Type } from "@sinclair/typebox";

export const createJsonValue = (id: string) => Type.Recursive((This) =>
    Type.Union([
      Type.String(),
      Type.Number(),
      Type.Boolean(),
      Type.Null(),
      Type.Array(This),
      Type.Record(Type.String(), This),
    ]),
  { $id: id }
);