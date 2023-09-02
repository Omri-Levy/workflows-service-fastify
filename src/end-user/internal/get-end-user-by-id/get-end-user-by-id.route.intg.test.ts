import { cleanupDatabase, tearDownDatabase } from "@/test/helpers/database-helper";
import { EndUserService } from "@/end-user/end-user.service";
import { EndUserRepository } from "@/end-user/end-user.repository";
import { db } from "@/db/client";
import { build, TApp } from "@/server";
import { InjectOptions } from "fastify";
import { AuthSetupFn, setupAuth } from "@/test/setup-auth";

describe("/api/v1/internal/end-users/:id #api #integration #internal", () => {
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

  describe("when unauthenticated", () => {
    it("should return 401", async () => {

      // Arrange
      const injectOptions = {
        method: "GET",
        url: "/api/v1/internal/end-users/1"
      } satisfies InjectOptions;

      // Act
      const res = await app.inject(injectOptions);

      // Assert
      expect(res.statusCode).toEqual(401);
    });
  });

  describe("when the end-user does not exist", () => {
    it("should return 404", async () => {

      // Arrange
      const injectOptions = {
        method: "GET",
        url: "/api/v1/internal/end-users/1"
      } satisfies InjectOptions;

      // Act
      const authHeaders = await authFn.getHeaders();
      const res = await app.inject({
        ...injectOptions,
        ...authHeaders
      });

      // Assert
      expect(res.statusCode).toBe(404);

    });
  });

  describe("when the end-user exists", () => {
    it("should the end-user belonging to the given id", async () => {
      // Arrange
      const endUser = await endUserService.create({
        data: {
          firstName: "test",
          lastName: "lastName"
        }
      });
      const injectOptions = {
        method: "GET",
        url: `/api/v1/internal/end-users/${endUser.id}`
      } satisfies InjectOptions;

      // Act
      const authHeaders = await authFn.getHeaders();
      const res = await app.inject({
        ...injectOptions,
        ...authHeaders
      });
      const json = await res.json();

      // Assert
      expect(res.statusCode).toEqual(200);
      expect(json).toMatchObject({
        id: expect.any(String),
        firstName: "test",
        lastName: "lastName"
      });

    });
  });

});
