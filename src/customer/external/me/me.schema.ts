import { Customer, CustomerStatuses } from "@prisma/client";
import { TypeDateString, TypeNullable } from "@/common/schemas/schemas";
import { BadRequestSchema, InternalServerErrorSchema, UnauthorizedSchema } from "@/common/schemas/http-schemas";
import { typeboxBuilder } from "@/common/utils/typebox-builder/typebox-builder";
import { Type } from "@sinclair/typebox";

export const MeRouteExternalSchema = {
  response: {
    200: typeboxBuilder<Partial<Customer>>()(
      Type.Partial(
        Type.Object({
          id: Type.String(),
          name: Type.String(),
          displayName: Type.String(),
          logoImageUri: Type.String(),
          customerStatus: Type.Enum(CustomerStatuses),
          authenticationConfiguration: TypeNullable(
            Type.Object({
              apiType: Type.Union([
                Type.Literal("API_KEY"),
                Type.Literal("OAUTH2"),
                Type.Literal("BASIC_AUTH"),
              ]),
              authValue: Type.String(),
              validUntil: TypeNullable(Type.String()),
              isValid: Type.Boolean(),
            }),
          ),
          country: TypeNullable(Type.String()),
          language: TypeNullable(Type.String()),
          createdAt: TypeDateString,
          updatedAt: TypeDateString
        })
      )
    ),
    400: BadRequestSchema,
    401: UnauthorizedSchema,
    500: InternalServerErrorSchema
  }
};