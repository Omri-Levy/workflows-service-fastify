import { User } from "@prisma/client";
import { isRecordNotFoundError } from "@/db/db.util";
import fastifyPassport from "@fastify/passport";
import FastifyPlugin from "fastify-plugin";
import { UserService } from "@/user/user.service";
import { UserRepository } from "@/user/user.repository";
import { db } from "@/db/client";
import { PasswordService } from "@/auth/password/password.service";

export const PassportSessionSerializerPlugin = FastifyPlugin(async () => {
  const passwordService = new PasswordService();
  const userRepository = new UserRepository(db, passwordService);
  const userService = new UserService(userRepository);

  fastifyPassport.registerUserSerializer(async (user: User): Promise<Pick<User, "id" | "email" | "firstName" | "lastName"> | null> => {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    };
  });

  fastifyPassport.registerUserDeserializer(async (user: User): Promise<Omit<User, "password"> | null> => {
    try {
      const { password: _password, ...userResult } = await userService.getById(user.id);

      return userResult;
    } catch (err) {
      if (!isRecordNotFoundError(err)) throw err;

      return null;
    }
  });
});

