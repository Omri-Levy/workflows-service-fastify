import { InjectOptions } from "fastify";
import { build, TApp } from "@/server";
import { PasswordService } from "@/auth/password/password.service";
import { UserRepository } from "@/user/user.repository";
import { db } from "@/db/client";
import { UserService } from "@/user/user.service";
import { cleanupDatabase, tearDownDatabase } from "@/test/helpers/database-helper";

describe("POST /api/v1/internal/auth/logout #api #integration #internal", () => {
  let app: TApp;
  const passwordService = new PasswordService();
  const userRepository = new UserRepository(
    db,
    passwordService
  );
  const userService = new UserService(
    userRepository
  );

  beforeAll(async () => {
    app = await build();
  });
  beforeEach(async () => {
    await cleanupDatabase(db);
  });
  afterAll(async () => {
    await tearDownDatabase(db);
  });

  describe("when unauthenticated", () => {
    it("should do nothing", async () => {

      // Arrange
      const injectOptions = {
        method: "POST",
        url: "/api/v1/internal/auth/logout"
      } satisfies InjectOptions;

      // Act
      const res = await app.inject(injectOptions);

      // Assert
      expect(res.statusCode).toBe(200);
    });
  });

  describe("when authenticated", () => {
    it("should clear the session", async () => {

      // Arrange
      const loginInjectOptions = {
        method: "POST",
        url: "/api/v1/internal/auth/login",
        body: {
          email: "test@test.com",
          password: "password"
        }
      } satisfies InjectOptions;
      const injectOptions = {
        method: "POST",
        url: "/api/v1/internal/auth/logout"
      } satisfies InjectOptions;
      await userService.create({
        data: {
          email: "test@test.com",
          password: "password",
          firstName: "John",
          lastName: "Doe",
          roles: ["user"]
        }
      });
      await app.inject(loginInjectOptions);

      // Act
      const res = await app.inject(injectOptions);

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.headers["set-cookie"]).not.toEqual(expect.stringContaining("session="));
    });
  });

});