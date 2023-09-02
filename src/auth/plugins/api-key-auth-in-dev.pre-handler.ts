import { env } from "@/env";
import { FastifyRequest } from "fastify";
import { apiKeyAuthPreHandler } from "@/auth/plugins/api-key-auth.pre-handler";

export const apiKeyAuthInDevPreHandler = async (
  req: FastifyRequest
) => {
  if (env.NODE_ENV !== 'development' && env.NODE_ENV !== 'local') return;

  return apiKeyAuthPreHandler(req);
};