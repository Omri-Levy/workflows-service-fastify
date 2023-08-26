import { CustomError } from "@/common/errors/custom-error";
import { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { getReasonPhrase, StatusCodes } from "http-status-codes";
import { fastifyErrorToCustom } from "@/common/errors/fastify-error-to-custom";
import { ZodValidationError } from "@/common/errors/zod-validation-error";

export const ErrorHandlerPlugin = (fastifyError: FastifyError, req: FastifyRequest, reply: FastifyReply) => {
  const error = fastifyErrorToCustom(fastifyError);

  if (fastifyError instanceof ZodValidationError) {
    return reply.status(StatusCodes.BAD_REQUEST).send({
      status: getReasonPhrase(StatusCodes.BAD_REQUEST),
      message: fastifyError.message,
      errors: fastifyError.serializeErrors()
    });
  }

  if (error instanceof CustomError) {
    return reply.status(error.status).send({
      status: error.status,
      message: error.message,
    });
  }

  return reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
    status: StatusCodes.INTERNAL_SERVER_ERROR,
    message: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
  });
}