import { InjectOptions } from "fastify";
import { build } from "@/server";
import { PasswordService } from "@/auth/password/password.service";
import { UserRepository } from "@/user/user.repository";
import { db } from "@/db/client";
import { UserService } from "@/user/user.service";
import { cleanupDatabase, tearDownDatabase } from "@/test/helpers/database-helper";

describe("POST /api/v1/internal/auth/login #api #integration #internal", () => {
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

  describe("when missing required fields", () => {
    it("should return 400", async () => {

      // Arrange
      const injectOptions = {
        method: "POST",
        url: "/api/v1/internal/auth/login",
        body: {}
      } satisfies InjectOptions;

      // Act
      const res = await app.inject(injectOptions);

      // Assert
      expect(res.statusCode).toBe(400);
    });
  });

  describe("when fields are invalid", () => {
    it("should return 400", async () => {

      // Arrange
      const injectOptions = {
        method: "POST",
        url: "/api/v1/internal/auth/login",
        body: {
          email: "invalidEmail",
          password: {}
        }
      } satisfies InjectOptions;

      // Act
      const res = await app.inject(injectOptions);

      // Assert
      expect(res.statusCode).toBe(400);
    });
  });

  describe("when the user does not exist", () => {
    it("should return 400", async () => {

      // Arrange
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

      // Assert
      expect(res.statusCode).toBe(401);
    });
  });

  describe("when wrong email is used", () => {
    it("should return 400", async () => {

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
          email: "wrong@email.com",
          password: "password"
        }
      } satisfies InjectOptions;

      // Act
      const res = await app.inject(injectOptions);

      // Assert
      expect(res.statusCode).toBe(401);
    });
  });

  describe("when wrong password is used", () => {
    it("should return 400", async () => {

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
          password: "wrongPassword"
        }
      } satisfies InjectOptions;

      // Act
      const res = await app.inject(injectOptions);

      // Assert
      expect(res.statusCode).toBe(401);
    });
  });

  describe("when fields are valid", () => {
    it("should log in successfully", async () => {

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
      const injectPayload = {
        method: "POST",
        url: "/api/v1/internal/auth/login",
        body: {
          email: "test@test.com",
          password: "password"
        }
      } satisfies InjectOptions;

      // Act
      const res = await app.inject(injectPayload);
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
      expect(res.headers["set-cookie"]).toEqual(expect.stringContaining("session="));
    });
  });

});
