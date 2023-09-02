import { build } from "@/server";
import { db } from "@/db/client";
import { cleanupDatabase, tearDownDatabase } from "@/test/helpers/database-helper";
import { UserRepository } from "@/user/user.repository";
import { UserService } from "@/user/user.service";
import { PasswordService } from "@/auth/password/password.service";
import { InjectOptions } from "fastify";

describe("GET /api/v1/internal/auth/session #api #integration #internal", () => {
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
    it("should return a user object with a value of null", async () => {

      // Arrange
      const injectOptions = {
        method: "GET",
        url: "/api/v1/internal/auth/session"
      } satisfies InjectOptions;

      // Act
      const res = await app.inject(injectOptions);
      const json = await res.json();

      // Assert
      expect(res.statusCode).toBe(200);
      expect(json).toEqual({
        user: null
      });
    });
  });

  describe("when authenticated", () => {
    it("should return a user object", async () => {

      // Arrange
      await userService.create({
        data: {
          email: "test@test.com",
          password: "password",
          firstName: "John",
          lastName: "Doe",
          roles: ["user"]
        }
      });
      const injectOptions = {
        method: "POST",
        url: "/api/v1/internal/auth/login",
        body: {
          email: "test@test.com",
          password: "password"
        }
      } satisfies InjectOptions;

      // Act
      const res = await app.inject(injectOptions);
      const json = await res.json();

      // Assert
      expect(res.statusCode).toBe(200);
      expect(json).toMatchObject({
        user: {
          id: expect.any(String),
          email: "test@test.com",
          firstName: "John",
          lastName: "Doe"
        }
      });
      expect(json.user.password).not.toBeDefined();

    });

  });

});