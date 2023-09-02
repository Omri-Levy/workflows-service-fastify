import { build, TApp } from "@/server";
import { EndUserRepository } from "@/end-user/end-user.repository";
import { db } from "@/db/client";
import { EndUserService } from "@/end-user/end-user.service";
import { cleanupDatabase, tearDownDatabase } from "@/test/helpers/database-helper";
import { InjectOptions } from "fastify";

describe("POST /api/v1/external/end-users #api #integration #external", () => {
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
        method: "POST",
        url: "/api/v1/external/end-users",
        body: {}
      } satisfies InjectOptions;

      // Act
      const res = await app.inject(injectOptions);

      // Assert
      expect(res.statusCode).toEqual(401);
    });
  });

  describe("when missing required fields", () => {
    it("should return 400", async () => {

      // Arrange
      const injectOptions = {
        method: "POST",
        url: "/api/v1/external/end-users",
        body: {}
      } satisfies InjectOptions;

      // Act
      const res = await app.inject(injectOptions);

      // Assert
      expect(res.statusCode).toEqual(400);
    });
  });

  describe("when fields are invalid", () => {
    it("should return 400", async () => {

      // Arrange
      const injectOptions = {
        method: "POST",
        url: "/api/v1/external/end-users",
        body: {
          firstName: false,
          lastName: {}
        }
      } satisfies InjectOptions;

      // Act
      const res = await app.inject(injectOptions);

      // Assert
      expect(res.statusCode).toEqual(400);

    });
  });

  describe("when fields are valid", () => {
    it("should create an end-user", async () => {

      // Arrange
      const injectOptions = {
        method: "POST",
        url: "/api/v1/external/end-users",
        body: {
          firstName: "test",
          lastName: "lastName"
        }
      } satisfies InjectOptions;

      // Act
      const res = await app.inject(injectOptions);
      const json = await res.json();
      const endUser = await endUserService.getById(json.id);

      // Assert
      expect(res.statusCode).toBe(201);
      expect(json).toMatchObject({
        id: expect.any(String),
        firstName: "test",
        lastName: "lastName"
      });
      expect(endUser).toMatchObject({
        id: expect.any(String),
        firstName: "test",
        lastName: "lastName"
      });

    });
  });


  // Currently `correlationId` is not passed at `create`, and `update` is not exposed
  describe.skip("when `correlationId` already exists", () => {
    it("should return 400", async () => {

      // Arrange
      const injectOptions = {
        method: "POST",
        url: "/api/v1/external/end-users",
        body: {
          firstName: "test",
          lastName: "lastName",
          correlationId: "test"
        }
      } satisfies InjectOptions;

      const duplicateCorrelationIdInjectOptions = {
        method: "POST",
        url: "/api/v1/external/end-users",
        body: {
          firstName: "test2",
          lastName: "lastName2",
          correlationId: "test"
        }
      } satisfies InjectOptions;

      // Act
      await app.inject(injectOptions);
      const duplicateCorrelationIdRes = await app.inject(duplicateCorrelationIdInjectOptions);
      const duplicateCorrelationIdJson = await duplicateCorrelationIdRes.json();

      // Assert
      expect(duplicateCorrelationIdRes.statusCode).toBe(400);
      expect(duplicateCorrelationIdJson.message).toBe("Correlation id already in use");

    });
  });

});
