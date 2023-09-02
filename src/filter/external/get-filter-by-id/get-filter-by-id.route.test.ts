import { cleanupDatabase, tearDownDatabase } from "@/test/helpers/database-helper";
import { FilterService } from "@/filter/filter.service";
import { FilterRepository } from "@/filter/filter.repository";
import { db } from "@/db/client";
import { build } from "@/server";
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

  it("should return 401 for unauthorized requests", async () => {

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

  it("should return 404 for non-existent filter", async () => {

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

  it("should return a filter", async () => {

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