import { cleanupDatabase, tearDownDatabase } from "@/test/helpers/database-helper";
import { FilterService } from "@/filter/filter.service";
import { FilterRepository } from "@/filter/filter.repository";
import { db } from "@/db/client";
import { build } from "@/server";
import { InjectOptions } from "fastify";
import { AuthSetupFn, setupAuth } from "@/test/setup-auth";

describe("GET /api/v1/internal/filters/:id #api #integration #internal", () => {
  let app: TApp;
  let authFn: AuthSetupFn;
  const filterRepository = new FilterRepository(
    db
  );
  const filterService = new FilterService(
    filterRepository
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

  it("should return 401 for unauthorized requests", async () => {

    // Arrange
    const injectOptions = {
      method: "GET",
      url: "/api/v1/internal/filters/1"
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
      url: "/api/v1/internal/filters/1"
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
      url: `/api/v1/internal/filters/${filter.id}`
    } satisfies InjectOptions;

    // Act
    const authHeaders = await authFn.getHeaders();
    const res = await app.inject({
      ...injectOptions,
      ...authHeaders
    });
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
      }
    });
  });

});
