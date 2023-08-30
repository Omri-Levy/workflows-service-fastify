import { build } from "@/server";
import { cleanupDatabase, tearDownDatabase } from "@/test/helpers/database-helper";
import { db } from "@/db/client";
import { InjectOptions } from "fastify";

describe("/api/v1/health #api #integration", () => {
  let app: Awaited<ReturnType<typeof build>>;

  beforeAll(async () => {
    app = await build();
  });
  beforeEach(async () => {
    await cleanupDatabase(db);
  });
  afterAll(async () => {
    await tearDownDatabase(db);
  });


  describe("GET /live", () => {
    it("should return 204", async () => {

      // Arrange
      const injectOptions = {
        method: "GET",
        url: "/api/v1/health/live"
      } satisfies InjectOptions;

      // Act
      const res = await app.inject(injectOptions);

      // Assert
      expect(res.statusCode).toBe(204);
    });
  });

  describe("GET /ready", () => {
    it("should return 204", async () => {

      // Arrange
      const injectOptions = {
        method: "GET",
        url: "/api/v1/health/ready"
      } satisfies InjectOptions;

      // Act
      const res = await app.inject(injectOptions);

      // Assert
      expect(res.statusCode).toBe(204);
    });
  });
});