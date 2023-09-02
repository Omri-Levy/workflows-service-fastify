import { cleanupDatabase, tearDownDatabase } from "@/test/helpers/database-helper";
import { UserService } from "@/user/user.service";
import { UserRepository } from "@/user/user.repository";
import { db } from "@/db/client";
import { build, TApp } from "@/server";
import { PasswordService } from "@/auth/password/password.service";
import { InjectOptions } from "fastify";
import { AuthSetupFn, setupAuth } from "@/test/setup-auth";

describe("GET /api/v1/internal/users #api #integration #internal", () => {
  let app: TApp;
  let authFn: AuthSetupFn;
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
    authFn = setupAuth(app);
  });
  beforeEach(async () => {
    await cleanupDatabase(db);
    await authFn.createUser();
  });
  afterAll(async () => {
    await tearDownDatabase(db);
  });

  describe("when unauthenticated", () => {
    it("should return 401", async () => {

      // Arrange
      const injectOptions = {
        method: "GET",
        url: "/api/v1/internal/users"
      } satisfies InjectOptions;

      // Act
      const res = await app.inject(injectOptions);

      // Assert
      expect(res.statusCode).toEqual(401);

    });
  });

  describe("when no users exist", () => {
    it("should return 401", async () => {

      // Arrange
      const injectOptions = {
        method: "GET",
        url: "/api/v1/internal/users"
      } satisfies InjectOptions;

      // Act
      const authHeaders = await authFn.getHeaders();
      await userRepository.deleteManyByIds();
      const res = await app.inject({
        ...injectOptions,
        ...authHeaders
      });
      const json = await res.json();

      // Assert
      expect(res.statusCode).toBe(401);
    });
  });

  describe("when users exist", () => {
    it("should return an array of users", async () => {

      // Arrange
      const injectOptions = {
        method: "GET",
        url: "/api/v1/internal/users"
      } satisfies InjectOptions;
      await userService.create({
        data: {
          email: "test1@test1.com",
          firstName: "test1",
          lastName: "lastName1",
          password: "password1",
          roles: ["admin"]
        }
      });
      await userService.create({
        data: {
          email: "test2@test2.com",
          firstName: "test2",
          lastName: "lastName2",
          password: "password2",
          roles: ["user"]
        }
      });

      // Act
      const authHeaders = await authFn.getHeaders();
      const res = await app.inject({
        ...injectOptions,
        ...authHeaders
      });
      const json = await res.json();

      // Assert
      expect(res.statusCode).toBe(200);
      expect(json).toEqual([
        // User created by setupAuth
        expect.objectContaining({
          id: expect.any(String),
          email: "login@test.com",
          firstName: "John",
          lastName: "Doe",
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          phone: null
        }),
        expect.objectContaining({
          id: expect.any(String),
          email: "test1@test1.com",
          firstName: "test1",
          lastName: "lastName1",
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          phone: null
        }),
        expect.objectContaining({
          id: expect.any(String),
          email: "test2@test2.com",
          firstName: "test2",
          lastName: "lastName2",
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          phone: null
        })
      ]);

    });
  });

});
