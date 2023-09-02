import { cleanupDatabase, tearDownDatabase } from "@/test/helpers/database-helper";
import { FilterService } from "@/filter/filter.service";
import { FilterRepository } from "@/filter/filter.repository";
import { db } from "@/db/client";
import { build, TApp } from "@/server";
import { InjectOptions } from "fastify";

describe("GET /api/v1/external/filters/:id #api #integration #external", () => {
  let app: TApp;
  const filterRepository = new FilterRepository(
    db
  );
  const filterService = new FilterService(
    filterRepository
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

  describe("when unauthenticated", () => {
    it("should return 401", async () => {

      // Arrange
      const injectOptions = {
        method: "GET",
        url: "/api/v1/external/filters/1"
      } satisfies InjectOptions;

      // Act
      const res = await app.inject(injectOptions);

      // Assert
      expect(res.statusCode).toBe(401);

    });
  });

  describe("when the filter does not exist", () => {
    it("should return 404", async () => {

      // Arrange
      const injectOptions = {
        method: "GET",
        url: "/api/v1/external/filters/1"
      } satisfies InjectOptions;

      // Act
      const res = await app.inject(injectOptions);

      // Assert
      expect(res.statusCode).toBe(404);

    });
  });


  describe("when the filter exists", () => {
    it("should return the filter belonging to the given id", async () => {

      // Arrange
      const filter = await filterService.create({
        data: {
          name: "test3",
          entity: "businesses",
          query: {
            select: {
              business: {
                select: {
                  companyName: true
                }
              }
            },
            where: {
              business: {
                is: {
                  registrationNumber: "registrationNumber"
                }
              }
            }
          }
        }
      });
      const injectOptions = {
        method: "GET",
        url: `/api/v1/external/filters/${filter.id}`
      } satisfies InjectOptions;

      // Act
      const res = await app.inject(injectOptions);
      const json = await res.json();

      // Assert
      expect(res.statusCode).toBe(200);
      expect(json).toMatchObject({
        id: expect.any(String),
        name: "test3",
        entity: "businesses",
        query: {
          select: {
            business: {
              select: {
                companyName: true
              }
            }
          },
          where: {
            business: {
              is: {
                registrationNumber: "registrationNumber"
              }
            }
          }
        },
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        createdBy: "SYSTEM"
      });
    });
  });

});