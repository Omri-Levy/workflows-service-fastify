import { build, TApp } from "@/server";
import { cleanupDatabase, tearDownDatabase } from "@/test/helpers/database-helper";
import { db } from "@/db/client";
import { InjectOptions } from "fastify";

describe("GET /api/v1/health/ready #api #integration", () => {
  let app: TApp;

  beforeAll(async () => {
    app = await build();
  });
  beforeEach(async () => {
    await cleanupDatabase(db);
  });
  afterAll(async () => {
    await tearDownDatabase(db);
  });

  describe("when the server is ready", () => {
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