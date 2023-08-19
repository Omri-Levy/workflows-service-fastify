import { cleanupDatabase, tearDownDatabase } from "@/test/helpers/database-helper";
import { EndUserService } from "@/end-user/end-user.service";
import { EndUserRepository } from "@/end-user/end-user.repository";
import { db } from "@/db/client";
import { build } from "@/server";

describe("/api/v1/internal/end-users #api #integration #internal", () => {
  let app: Awaited<ReturnType<typeof build>>;
  const endUserRepository = new EndUserRepository(
    db
  );
  const endUserService = new EndUserService(
    endUserRepository
  );

  beforeAll(async () => {
    app = await build();
  });
  beforeEach(cleanupDatabase);
  afterEach(tearDownDatabase);


  describe("GET /", () => {

    it.skip("should return 401 for unauthorized requests", async () => {
      // Arrange

      // Act
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/internal/end-users"
      });

      // Assert
      expect(res.statusCode).toBe(401);
    });

    it("should return an empty array if no end-users exist", async () => {
      // Arrange

      // Act
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/internal/end-users"
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

      // Act
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/internal/end-users"
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

  describe("GET /:id", () => {
    it.skip("should return 401 for unauthorized requests", async () => {
      // Arrange

      // Act
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/internal/end-users/1"
      });

      // Assert
      expect(res.statusCode).toBe(401);
    });

    it("should return 404 for non-existent end-user", async () => {
      // Arrange

      // Act
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/internal/end-users/1"
      });

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

      // Act
      const res = await app.inject({
        method: "GET",
        url: `/api/v1/internal/end-users/${endUser.id}`
      });
      const json = await res.json();

      // Assert
      expect(res.statusCode).toBe(200);
      expect(json).toMatchObject(expect.objectContaining({
        id: expect.any(String),
        firstName: "test",
        lastName: "lastName"
      }));
    });
  });

});
