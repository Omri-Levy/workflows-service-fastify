import { TSchema } from "@sinclair/typebox";

export const typeboxBuilder = <TType>() =>
  <T extends TSchema & {
    static: TType;
  }>(schema: T) => schema;