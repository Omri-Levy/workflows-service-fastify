import { cleanupDatabase, tearDownDatabase } from "@/test/helpers/database-helper";
import { UserService } from "@/user/user.service";
import { UserRepository } from "@/user/user.repository";
import { db } from "@/db/client";
import { build } from "@/server";
import { PasswordService } from "@/auth/password/password.service";
import { InjectOptions } from "fastify";
import { AuthSetupFn, setupAuth } from "@/test/setup-auth";

describe("POST /api/v1/internal/users #api #integration #internal", () => {
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
      method: "POST",
      url: "/api/v1/internal/users",
      body: {}
    } satisfies InjectOptions;

    // Act
    const authHeaders = await authFn.getHeaders();
    const res = await app.inject({
      ...injectOptions,
      ...authHeaders
    });

    // Assert
    expect(res.statusCode).toBe(401);
  });

  it("should return 400 for missing required fields", async () => {

    // Arrange
    const injectOptions = {
      method: "POST",
      url: "/api/v1/internal/users",
      body: {}
    } satisfies InjectOptions;

    // Act
    const authHeaders = await authFn.getHeaders();
    const res = await app.inject({
      ...injectOptions,
      ...authHeaders
    });

    // Assert
    expect(res.statusCode).toBe(400);
  });

  it("should return 400 for invalid fields", async () => {

    // Arrange
    const injectOptions = {
      method: "POST",
      url: "/api/v1/internal/users",
      body: {
        email: false,
        firstName: {},
        lastName: [],
        password: 123,
        roles: "admin"
      }
    } satisfies InjectOptions;

    // Act
    const authHeaders = await authFn.getHeaders();
    const res = await app.inject({
      ...injectOptions,
      ...authHeaders
    });

    // Assert
    expect(res.statusCode).toBe(400);
  });

  it("creates an user", async () => {

    // Arrange
    const injectOptions = {
      method: "POST",
      url: "/api/v1/internal/users",
      body: {
        email: "test3@test3.com",
        firstName: "test",
        lastName: "lastName",
        password: "password",
        roles: ["admin"]
      }
    } satisfies InjectOptions;

    // Act
    const authHeaders = await authFn.getHeaders();
    const res = await app.inject({
      ...injectOptions,
      ...authHeaders
    });
    const json = await res.json();
    const user = await userService.getById(json.id);

    // Assert
    expect(res.statusCode).toBe(201);
    expect(json).toMatchObject({
      id: expect.any(String),
      email: "test3@test3.com",
      firstName: "test",
      lastName: "lastName",
      roles: ["admin"]
    });
    expect(user).toMatchObject({
      id: expect.any(String),
      email: "test3@test3.com",
      firstName: "test",
      lastName: "lastName",
      roles: ["admin"]
    });
  });

  it("should return 400 for unique constraints", async () => {

    // Arrange
    const injectOptions = {
      method: "POST",
      url: "/api/v1/internal/users",
      body: {
        email: "test3@test3.com",
        firstName: "test",
        lastName: "lastName",
        password: "password",
        roles: ["admin"]
        // phone: "123456789"
      }
    } satisfies InjectOptions;
    const duplicateEmailInjectOptions = {
      method: "POST",
      url: "/api/v1/internal/users",
      body: {
        email: "test3@test3.com",
        firstName: "test2",
        lastName: "lastName2",
        password: "password2",
        roles: ["user"]
        // phone: "0123456789"
      }
    } satisfies InjectOptions;
    const duplicatePhoneInjectOptions = {
      method: "POST",
      url: "/api/v1/internal/users",
      body: {
        email: "test4@test4.com",
        firstName: "test2",
        lastName: "lastName2",
        password: "password2",
        roles: ["user"],
        phone: "123456789"
      }
    } satisfies InjectOptions;

    // Act
    const authHeaders = await authFn.getHeaders();
    await app.inject({
      ...injectOptions,
      ...authHeaders
    });
    const duplicateEmailRes = await app.inject({
      ...duplicateEmailInjectOptions,
      ...authHeaders
    });
    const duplicateEmailJson = await duplicateEmailRes.json();
    // const duplicatePhoneRes = await app.inject(duplicatePhoneInjectOptions);

    // Assert
    expect(duplicateEmailRes.statusCode).toBe(400);
    expect(duplicateEmailJson.message).toBe("Email already in use");
    // expect(duplicatePhoneRes.statusCode).toBe(400);

  });

});