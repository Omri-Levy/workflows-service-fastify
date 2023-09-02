import { cleanupDatabase, tearDownDatabase } from "@/test/helpers/database-helper";
import { EndUserService } from "@/end-user/end-user.service";
import { EndUserRepository } from "@/end-user/end-user.repository";
import { db } from "@/db/client";
import { build } from "@/server";
import { InjectOptions } from "fastify";
import { AuthSetupFn, setupAuth } from "@/test/setup-auth";

describe("GET /api/v1/internal/end-users #api #integration #internal", () => {
  let app: TApp;
  let authFn: AuthSetupFn;
  const endUserRepository = new EndUserRepository(
    db
  );
  const endUserService = new EndUserService(
    endUserRepository
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
      url: "/api/v1/internal/end-users"
    } satisfies InjectOptions;

    // Act
    const res = await app.inject(injectOptions);

    // Assert
    expect(res.statusCode).toBe(401);
  });

  it("should return an empty array if no end-users exist", async () => {

    // Arrange
    const injectOptions = {
      method: "GET",
      url: "/api/v1/internal/end-users"
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

  it("should return an array of end-users", async () => {

    // Arrange
    await endUserService.create({
      data: {
        firstName: "test",
        lastName: "lastName"
      }
    });
    await endUserService.create({
      data: {
        firstName: "test2",
        lastName: "lastName2"
      }
    });
    const injectOptions = {
      method: "GET",
      url: "/api/v1/internal/end-users"
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
    expect(json).toEqual([
      expect.objectContaining({
        id: expect.any(String),
        firstName: "test",
        lastName: "lastName"
      }),
      expect.objectContaining({
        id: expect.any(String),
        firstName: "test2",
        lastName: "lastName2"
      })
    ]);
  });

});
