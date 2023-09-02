import { EndUserSchema } from "@/end-user/end-user.schema";
import { BusinessSchema } from "@/business/business.schema";
import { Type } from "@sinclair/typebox";
import { BaseEndUsersOnBusinessesSchema } from "@/common/schemas/base-end-users-on-businesses.schema";

export const EndUsersOnBusinessesSchema = Type.Composite(
  [
    BaseEndUsersOnBusinessesSchema,
    Type.Object({
      endUser: EndUserSchema,
      business: BusinessSchema
    })
  ]
);