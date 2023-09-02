import { build, TApp } from "@/server";
import { EndUserRepository } from "@/end-user/end-user.repository";
import { db } from "@/db/client";
import { EndUserService } from "@/end-user/end-user.service";
import { cleanupDatabase, tearDownDatabase } from "@/test/helpers/database-helper";
import { InjectOptions } from "fastify";

describe("GET /api/v1/external/end-users #api #integration #external", () => {
  let app: TApp;
  const endUserRepository = new EndUserRepository(
    db
  );
  const endUserService = new EndUserService(
    endUserRepository
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

  describe.skip("when unauthenticated", () => {
    it("should return 401", async () => {

      // Arrange
      const injectOptions = {
        method: "GET",
        url: "/api/v1/external/end-users"
      } satisfies InjectOptions;

      // Act
      const res = await app.inject(injectOptions);

      // Assert
      expect(res.statusCode).toEqual(401);

    });
  });

  describe("when no end-users exist", () => {
    it("should return an empty array", async () => {

      // Arrange
      const injectOptions = {
        method: "GET",
        url: "/api/v1/external/end-users"
      } satisfies InjectOptions;

      // Act
      const res = await app.inject(injectOptions);
      const json = await res.json();

      // Assert
      expect(res.statusCode).toEqual(200);
      expect(json).toEqual([]);
    });
  });

  describe("when end-users exist", () => {
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
        url: "/api/v1/external/end-users"
      } satisfies InjectOptions;

      // Act
      const res = await app.inject(injectOptions);
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

});
