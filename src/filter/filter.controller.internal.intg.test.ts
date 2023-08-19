import { cleanupDatabase, tearDownDatabase } from "@/test/helpers/database-helper";
import { FilterService } from "@/filter/filter.service";
import { FilterRepository } from "@/filter/filter.repository";
import { db } from "@/db/client";
import { build } from "@/server";

describe("/api/v1/internal/filters #api #integration #internal", () => {
  let app: Awaited<ReturnType<typeof build>>;
  const filterRepository = new FilterRepository(
    db
  );
  const filterService = new FilterService(
    filterRepository
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
        url: "/api/v1/internal/filters"
      });

      // Assert
      expect(res.statusCode).toBe(401);
    });

    it("should return an empty array if no filters exist", async () => {
      // Arrange

      // Act
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/internal/filters"
      });
      const json = await res.json();

      // Assert
      expect(res.statusCode).toBe(200);
      expect(json).toEqual([]);
    });

    it("should return an array of filters", async () => {
      // Arrange
      await filterService.create({
        data: {
          name: "test1",
          entity: "business",
          query: {
            select: {
              firstName: true,
            },
            where: {
              lastName: "lastName"
            }
          }
        }
      });
      await filterService.create({
        data: {
          name: "test2",
          entity: "individual",
          query: {
            select: {
              lastName: true,
            },
            where: {
              firstName: "firstName2"
            }
          }
        }
      });

      // Act
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/internal/filters"
      });
      const json = await res.json();

      // Assert
      expect(res.statusCode).toBe(200);
      expect(json).toEqual([
        expect.objectContaining({
          id: expect.any(String),
          name: "test1",
          entity: "business",
          query: {
            select: {
              firstName: true,
            },
            where: {
              lastName: "lastName"
            }
          }
        }),
        expect.objectContaining({
          id: expect.any(String),
          name: "test2",
          entity: "individual",
          query: {
            select: {
              lastName: true,
            },
            where: {
              firstName: "firstName2"
            }
          }
        }),
      ]);
    });
  });

  describe("GET /:id", () => {
    it.skip("should return 401 for unauthorized requests", async () => {
      // Arrange

      // Act
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/internal/filters/1"
      });

      // Assert
      expect(res.statusCode).toBe(401);
    });

    it("should return 404 for non-existent filter", async () => {
      // Arrange

      // Act
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/internal/filters/1"
      });

      // Assert
      expect(res.statusCode).toBe(404);
    });

    it("should return a filter", async () => {
      // Arrange
      const filter = await filterService.create({
        data: {
          name: "test3",
          entity: "business",
          query: {
            select: {
              firstName: true,
            },
            where: {
              lastName: "lastName"
            }
          }
        }
      });

      // Act
      const res = await app.inject({
        method: "GET",
        url: `/api/v1/internal/filters/${filter.id}`
      });
      const json = await res.json();

      // Assert
      expect(res.statusCode).toBe(200);
      expect(json).toMatchObject({
        id: expect.any(String),
        name: "test3",
        entity: "business",
        query: {
          select: {
            firstName: true,
          },
          where: {
            lastName: "lastName"
          }
        }
      });
    });
  });

});
