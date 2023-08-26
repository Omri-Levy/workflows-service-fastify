import { FastifyError } from "fastify";
import { isKnownError, knownErrors } from "@/common/errors/known-errors";

export const fastifyErrorToCustom = (fastifyError: FastifyError) => {

  if (!isKnownError(fastifyError.statusCode)) return fastifyError;

  const KnownError = knownErrors[fastifyError.statusCode];

  if (!KnownError) return fastifyError;

  return new KnownError(fastifyError.message);
};