import { FastifyRequest } from "fastify";

export const getProjectIds = (req: FastifyRequest) => {
  return req.user?.projectIds;
}