import { CustomerStatuses } from "@prisma/client";
import { TypeDateString, TypeNullable } from "@/common/schemas/schemas";
import { BadRequestSchema, InternalServerErrorSchema, UnauthorizedSchema } from "@/common/schemas/http-schemas";
import { Type } from "@sinclair/typebox";

export const CreateCustomerRouteExternalSchema = {
  body: Type.Object({
    name: Type.String(),
    displayName: Type.String(),
    customerStatus: Type.Optional(
      Type.Enum(CustomerStatuses)
    ),
    logoImageUri: Type.String(),
    language: Type.Optional(Type.String()),
    country: Type.Optional(Type.String()),
    authenticationConfiguration: Type.Optional(Type.Object({
      apiType: Type.Union([
        Type.Literal("API_KEY"),
        Type.Literal("OAUTH2"),
        Type.Literal("BASIC_AUTH")
      ]),
      authValue: Type.String(),
      validUntil: Type.Optional(Type.String()),
      isValid: Type.Boolean()
    })),
    projectName: Type.Optional(Type.String())
  }),
  response: {
    201: Type.Object({
      id: Type.String(),
      name: Type.String(),
      displayName: Type.String(),
      logoImageUri: Type.String(),
      language: TypeNullable(Type.String()),
      country: Type.Optional(Type.String()),
      customerStatus: Type.Enum(CustomerStatuses),
      projects: Type.Optional(Type.Array(Type.Object({
        id: Type.String()
      }))),
      authenticationConfiguration: Type.Optional(Type.Object({
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
    400: BadRequestSchema,
    401: UnauthorizedSchema,
    500: InternalServerErrorSchema
  }
};