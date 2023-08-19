import { build } from "@/server";
import { cleanupDatabase, tearDownDatabase } from "@/test/helpers/database-helper";

describe("/api/v1/health #api #integration", () => {
  let app: Awaited<ReturnType<typeof build>>;

  beforeAll(async () => {
    app = await build();
  });
  beforeEach(cleanupDatabase);
  afterEach(tearDownDatabase);


  describe("GET /live", () => {
    it("should return 204", async () => {
      // Arrange

      // Act
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/health/live"
      });

      // Assert
      expect(res.statusCode).toBe(204);
    });
  });

  describe("GET /ready", () => {
    it("should return 204", async () => {
      // Arrange
      
      // Act
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/health/ready"
      });

      // Assert
      expect(res.statusCode).toBe(204);
    });
  });
});