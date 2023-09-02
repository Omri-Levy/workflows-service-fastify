import { Type } from "@sinclair/typebox";

export const BaseEndUsersOnBusinessesSchema = Type.Object({
  endUserId: Type.String(),
  businessId: Type.String()
});