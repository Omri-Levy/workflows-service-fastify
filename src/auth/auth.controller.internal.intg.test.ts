import { build } from "@/server";
import { db } from "@/db/client";
import { cleanupDatabase, tearDownDatabase } from "@/test/helpers/database-helper";
import { UserRepository } from "@/user/user.repository";
import { UserService } from "@/user/user.service";
import { PasswordService } from "@/auth/password/password.service";
import { InjectOptions } from "fastify";

describe("/api/v1/internal/auth #api #integration #internal", () => {
  let app: Awaited<ReturnType<typeof build>>;
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


  describe("POST /login", () => {

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

  describe("POST /logout", () => {

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

  describe("GET /session", () => {

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
            lastName: "Doe",
          }
        });
        expect(json.user.password).not.toBeDefined();

      });

    });

  });
});