import { UnauthorizedError } from "@/common/errors/unauthorized-error";
import { FastifyRequest } from "fastify";

export const authPreHandler = ({
  unprotectedRoutes
                               }: {
  unprotectedRoutes: Array<string>;
}) => async (req: FastifyRequest) => {
  if (unprotectedRoutes.includes(req.url) || req.isAuthenticated()) return;

  throw new UnauthorizedError();
};