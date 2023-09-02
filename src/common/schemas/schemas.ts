import { TSchema, Type } from "@sinclair/typebox";

export const createJsonValue = (id: string) => Type.Recursive((This) =>
    Type.Union([
      Type.String(),
      Type.Number(),
      Type.Boolean(),
      Type.Null(),
      Type.Array(This),
      Type.Record(Type.String(), This)
    ]),
  { $id: id }
);

export const TypeNullable = <TSchemas extends Array<TSchema>>(...schemas: TSchemas) => Type.Union([...schemas, Type.Null()]);

export const TypeNoNull = <T extends TSchema>(schema: T) =>
  Type.Exclude(schema, Type.Null());


export const TypeObjectWithId = Type.Object({
  id: Type.String()
});

export const TypeDateString = Type.Unsafe<Date>({
  type: "string",
  format: "date-time",
  description: "Bridges the gap between the ORM's type and the network's type"
});