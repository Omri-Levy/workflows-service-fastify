import { db } from "@/db/client";
import { AuthService } from "@/auth/auth.service";
import { UserService } from "@/user/user.service";
import { UserRepository } from "@/user/user.repository";
import { PasswordService } from "@/auth/password/password.service";
import { TokenService } from "@/auth/token/token.service";
import { JwtService } from "@nestjs/jwt";
import { plainToClass } from "class-transformer";
import { LoginDto } from "@/auth/dtos/login";
import util from "util";
import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";

export const authControllerInternal: FastifyPluginAsyncTypebox = async (fastify) => {
  const passwordService = new PasswordService();
  const userRepository = new UserRepository(
    db,
    passwordService
  );
  const userService = new UserService(
    userRepository
  );
  const jwtService = new JwtService();
  const tokenService = new TokenService(
    jwtService
  );
  const authService = new AuthService(userService, passwordService, tokenService);

  fastify.post("/login", async (req, reply) => {
    const data = plainToClass(LoginDto, req.body);

    return reply.send({ user: req.user });
  });
  fastify.post("/logout", async (req, reply) => {
    // @ts-expect-error - TODO: fix type
    const asyncLogout = util.promisify(req.logout.bind(req));

    await asyncLogout();

    await reply.clearCookie("session", { path: "/", httpOnly: true });
    await reply.clearCookie("session.sig", { path: "/", httpOnly: true });

    return reply.send({ user: undefined });
  });
  fastify.get("/session", async (req, reply) => {

    return reply.send({
      user: req?.user
    });
  });

};