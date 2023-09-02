import { Type } from "@sinclair/typebox";

export const BadRequestSchema = Type.Object({
  status: Type.String(),
  message: Type.String(),
});

export const UnauthorizedSchema = Type.Object({
  status: Type.String(),
  message: Type.String(),
});

export const ForbiddenSchema = Type.Object({
  status: Type.String(),
  message: Type.String(),
});

export const NotFoundSchema = Type.Object({
  status: Type.String(),
  message: Type.String(),
});

export const InternalServerErrorSchema = Type.Object({
  status: Type.String(),
  message: Type.String(),
});