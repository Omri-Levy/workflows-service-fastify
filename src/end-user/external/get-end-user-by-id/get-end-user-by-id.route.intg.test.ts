import { build } from "@/server";
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

  it.skip("should return 401 for unauthorized requests", async () => {

    // Arrange
    const injectOptions = {
      method: "GET",
      url: "/api/v1/external/end-users/1"
    } satisfies InjectOptions;

    // Act
    const res = await app.inject(injectOptions);


    // Assert
    expect(res.statusCode).toBe(401);
  });

  it("should return 404 for non-existent end-user", async () => {

    // Arrange
    const injectOptions = {
      method: "GET",
      url: "/api/v1/external/end-users/1"
    } satisfies InjectOptions;

    // Act
    const res = await app.inject(injectOptions);

    // Assert
    expect(res.statusCode).toBe(404);
  });

  it("should return an end-user", async () => {

    // Arrange
    const endUser = await endUserService.create({
      data: {
        firstName: "test",
        lastName: "lastName"
      }
    });
    const injectOptions = {
      method: "GET",
      url: `/api/v1/external/end-users/${endUser.id}`
    } satisfies InjectOptions;

    // Act
    const res = await app.inject(injectOptions);
    const json = await res.json();

    // Assert
    expect(res.statusCode).toBe(200);
    expect(json).toMatchObject({
      id: expect.any(String),
      firstName: "test",
      lastName: "lastName"
    });
  });

});
