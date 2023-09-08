import { CustomerStatuses } from "@prisma/client";
import { TypeDateString, TypeNullable } from "@/common/schemas/schemas";
import { BadRequestSchema, InternalServerErrorSchema, UnauthorizedSchema } from "@/common/schemas/http-schemas";
import { Type } from "@sinclair/typebox";

export const GetCustomerByFirstProjectIdRouteInternalSchema = {
  response: {
    200: TypeNullable(
      Type.Object({
        id: Type.String(),
        name: Type.String(),
        displayName: Type.String(),
        logoImageUri: Type.String(),
        language: TypeNullable(Type.String()),
        country: TypeNullable(Type.String()),
        customerStatus: Type.Enum(CustomerStatuses),
        projects: Type.Optional(Type.Array(Type.Object({
          id: Type.String()
        }))),
        authenticationConfiguration: TypeNullable(Type.Object({
          apiType: Type.Union([
            Type.Literal("API_KEY"),
            Type.Literal("OAUTH2"),
            Type.Literal("BASIC_AUTH")
          ]),
          authValue: Type.String(),
          validUntil: Type.Optional(Type.String()),
          isValid: Type.Boolean()
        })),
        updatedAt: TypeDateString,
        createdAt: TypeDateString
      }),
    ),
    400: BadRequestSchema,
    401: UnauthorizedSchema,
    500: InternalServerErrorSchema
  }
};