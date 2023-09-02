import { build } from "@/server";
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

  it.skip("should return 401 for unauthorized requests", async () => {

    // Arrange
    const injectOptions = {
      method: "POST",
      url: "/api/v1/external/end-users",
      body: {}
    } satisfies InjectOptions;

    // Act
    const res = await app.inject(injectOptions);

    // Assert
    expect(res.statusCode).toBe(401);
  });

  it("should return 400 for missing required fields", async () => {

    // Arrange
    const injectOptions = {
      method: "POST",
      url: "/api/v1/external/end-users",
      body: {}
    } satisfies InjectOptions;

    // Act
    const res = await app.inject(injectOptions);

    // Assert
    expect(res.statusCode).toBe(400);
  });

  it("should return 400 for invalid fields", async () => {

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
    expect(res.statusCode).toBe(400);
  });

  it("creates an end-user", async () => {

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

  // Currently `correlationId` is not passed at `create`, and `update` is not exposed
  it.skip("should return 400 for duplicate `correlationId`", async () => {

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
