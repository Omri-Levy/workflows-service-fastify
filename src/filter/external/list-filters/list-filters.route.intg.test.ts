import { cleanupDatabase, tearDownDatabase } from "@/test/helpers/database-helper";
import { FilterService } from "@/filter/filter.service";
import { FilterRepository } from "@/filter/filter.repository";
import { db } from "@/db/client";
import { build } from "@/server";
import { InjectOptions } from "fastify";

describe("GET /api/v1/external/filters #api #integration #external", () => {
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

  it("should return 401 for unauthorized requests", async () => {

    // Arrange
    const injectOptions = {
      method: "GET",
      url: "/api/v1/external/filters"
    } satisfies InjectOptions;

    // Act
    const res = await app.inject(injectOptions);


    // Assert
    expect(res.statusCode).toBe(401);
  });

  it("should return an empty array if no filters exist", async () => {

    // Arrange
    const injectOptions = {
      method: "GET",
      url: "/api/v1/external/filters"
    } satisfies InjectOptions;

    // Act
    const res = await app.inject(injectOptions);
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
    await filterService.create({
      data: {
        name: "test2",
        entity: "individuals",
        query: {
          select: {
            endUser: {
              select: {
                lastName: true
              }
            }
          },
          where: {
            endUser: {
              is: {
                firstName: "firstName2"
              }
            }
          }
        }
      }
    });
    const injectOptions = {
      method: "GET",
      url: "/api/v1/external/filters"
    } satisfies InjectOptions;

    // Act
    const res = await app.inject(injectOptions);

    const json = await res.json();

    // Assert
    expect(res.statusCode).toBe(200);
    expect(json).toEqual([
      expect.objectContaining({
        id: expect.any(String),
        name: "test1",
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
      }),
      expect.objectContaining({
        id: expect.any(String),
        name: "test2",
        entity: "individuals",
        query: {
          select: {
            endUser: {
              select: {
                lastName: true
              }
            }
          },
          where: {
            endUser: {
              is: {
                firstName: "firstName2"
              }
            }
          }
        }
      })
    ]);
  });

});