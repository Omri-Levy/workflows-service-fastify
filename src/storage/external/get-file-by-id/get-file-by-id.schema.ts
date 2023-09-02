import {
  BadRequestSchema,
  InternalServerErrorSchema,
  NotFoundSchema,
  UnauthorizedSchema
} from "@/common/schemas/http-schemas";
import { Type } from "@sinclair/typebox";
import { FileSchema } from "@/storage/file.schema";

export const GetFileByIdRouteExternalSchema = {
  params: Type.Object({
    id: Type.String()
  }),
  response: {
    200: FileSchema,
    400: BadRequestSchema,
    401: UnauthorizedSchema,
    404: NotFoundSchema,
    500: InternalServerErrorSchema
  }
};