import { Type } from "@sinclair/typebox";

export const PolicySchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  version: Type.Number(),
  tasks: Type.Any(),
  rulesSets: Type.Any()
});