import { build } from "@/server";
import { PasswordService } from "@/auth/password/password.service";
import { UserRepository } from "@/user/user.repository";
import { db } from "@/db/client";
import { UserService } from "@/user/user.service";

export const setupAuth = (app: Awaited<ReturnType<typeof build>>) => ({
  async createUser() {
    const passwordService = new PasswordService();
    const userRepository = new UserRepository(db, passwordService);
    const userService = new UserService(userRepository);

    await userService.create({
      data: {
        email: "login@test.com",
        password: "password",
        firstName: "John",
        lastName: "Doe",
        roles: ["user"]
      }
    });
  },
  async getHeaders() {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/internal/auth/login",
      body: {
        email: "login@test.com",
        password: "password"
      }
    });

    return {
      headers: {
        Cookie: res.headers["set-cookie"]
      }
    };
  }
});

export type AuthSetupFn = ReturnType<typeof setupAuth>;