import { cleanupDatabase, tearDownDatabase } from "@/test/helpers/database-helper";
import { UserService } from "@/user/user.service";
import { UserRepository } from "@/user/user.repository";
import { db } from "@/db/client";
import { build } from "@/server";
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

    it("should return 401 for unauthorized requests", async () => {

      // Arrange
      const injectOptions = {
        method: "GET",
        url: "/api/v1/internal/users"
      } satisfies InjectOptions;

      // Act
      const res = await app.inject(injectOptions);


      // Assert
      expect(res.statusCode).toBe(401);
    });

    it("should return an empty array if no users exist", async () => {

      // Arrange
      const injectOptions = {
        method: "GET",
        url: "/api/v1/internal/users"
      } satisfies InjectOptions;

      // Act
      const authHeaders = await authFn.getHeaders();
      const res = await app.inject({
        ...injectOptions,
        ...authHeaders
      });
      const json = await res.json();

      // Assert
      expect(res.statusCode).toBe(200);
      expect(json).toEqual([]);
    });

    it("should return an array of users", async () => {
      // Arrange
      const injectOptions = {
        method: "GET",
        url: "/api/v1/internal/users"
      } satisfies InjectOptions;
      await userService.create({
        data: {
          email: "login@login.com",
          firstName: "test",
          lastName: "lastName",
          password: "password",
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
        expect.objectContaining({
          id: expect.any(String),
          email: "test@test.com",
          firstName: "test",
          lastName: "lastName",
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
