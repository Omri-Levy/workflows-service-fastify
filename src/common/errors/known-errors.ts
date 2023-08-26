import { isType } from "@/common/utils/is-type/is-type";
import { BadRequestError } from "@/common/errors/bad-request-error";
import { NotFoundError } from "@/common/errors/not-found-error";
import { UnauthorizedError } from "@/common/errors/unauthorized-error";
import { ForbiddenError } from "@/common/errors/forbidden-error";
import { z } from "zod";
import { StatusCodes } from "http-status-codes";

export const knownErrors = {
  [StatusCodes.BAD_REQUEST]: BadRequestError,
  [StatusCodes.NOT_FOUND]: NotFoundError,
  [StatusCodes.UNAUTHORIZED]: UnauthorizedError,
  [StatusCodes.FORBIDDEN]: ForbiddenError
} as const;

export const KnownErrorsSchema = z.union([
  z.literal(StatusCodes.BAD_REQUEST),
  z.literal(StatusCodes.NOT_FOUND),
  z.literal(StatusCodes.UNAUTHORIZED),
  z.literal(StatusCodes.FORBIDDEN)
]);

export const isKnownError = isType(KnownErrorsSchema);