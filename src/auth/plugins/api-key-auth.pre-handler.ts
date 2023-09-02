import { env } from "@/env";
import { FastifyRequest } from "fastify";
import { UnauthorizedError } from "@/common/errors/unauthorized-error";

export const apiKeyAuthPreHandler = async (
  req: FastifyRequest
) => {
  const authHeader = req.headers.authorization;
  const apiKey = authHeader?.split(" ")[1];

  if (apiKey === env.API_KEY) return;

  throw new UnauthorizedError("Invalid API key");
};