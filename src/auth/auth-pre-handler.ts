import { UnauthorizedError } from "@/common/errors/unauthorized-error";
import { FastifyRequest } from "fastify";

export const authPreHandler = async (req: FastifyRequest) => {
  const unprotectedRoutes = [
    '/api/v1/internal/auth/session',
    '/api/v1/internal/auth/login'
  ];

  if (unprotectedRoutes.includes(req.url) || req.isAuthenticated()) return;

  throw new UnauthorizedError();
};