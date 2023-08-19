import { cleanupDatabase, tearDownDatabase } from "@/test/helpers/database-helper";
import { UserService } from "@/user/user.service";
import { UserRepository } from "@/user/user.repository";
import { db } from "@/db/client";
import { build } from "@/server";
import { PasswordService } from "@/auth/password/password.service";

describe("/api/v1/internal/users #api #integration #internal", () => {
  let app: Awaited<ReturnType<typeof build>>;
  const passwordService = new PasswordService();
  const userRepository = new UserRepository(
    db,
    passwordService
  );
  const userService = new UserService(
    userRepository
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
        url: "/api/v1/internal/users"
      });

      // Assert
      expect(res.statusCode).toBe(401);
    });

    it("should return an empty array if no users exist", async () => {
      // Arrange

      // Act
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/internal/users"
      });
      const json = await res.json();

      // Assert
      expect(res.statusCode).toBe(200);
      expect(json).toEqual([]);
    });

    it("should return an array of users", async () => {
      // Arrange
      await userService.create({
        data: {
          email: "test@test.com",
          firstName: "test",
          lastName: "lastName",
          password: "password",
          roles: ["admin"]
        }
      });
      await userService.create({
        data: {
          email: "test2@test2.com",
          firstName: "test2",
          lastName: "lastName2",
          password: "password2",
          roles: ["user"]
        }
      });

      // Act
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/internal/users"
      });
      const json = await res.json();

      // Assert
      expect(res.statusCode).toBe(200);
      expect(json).toEqual([
        expect.objectContaining({
          id: expect.any(String),
          email: "test@test.com",
          firstName: "test",
          lastName: "lastName",
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          phone: null
        }),
        expect.objectContaining({
          id: expect.any(String),
          email: "test2@test2.com",
          firstName: "test2",
          lastName: "lastName2",
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          phone: null
        })
      ]);
    });
  });

  describe("POST /", () => {

    it.skip("should return 401 for unauthorized requests", async () => {
      // Arrange

      // Act
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/internal/users",
        body: {}
      });

      // Assert
      expect(res.statusCode).toBe(401);
    });

    it("should return 400 for missing required fields", async () => {
      // Arrange

      // Act
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/internal/users",
        body: {}
      });

      // Assert
      expect(res.statusCode).toBe(400);
    });

    it("should return 400 for invalid fields", async () => {
      // Arrange

      // Act
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/internal/users",
        body: {
          email: false,
          firstName: {},
          lastName: [],
          password: 123,
          roles: "admin"
        }
      });

      // Assert
      expect(res.statusCode).toBe(400);
    });

    it("creates an user", async () => {
      // Arrange

      // Act
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/internal/users",
        body: {
          email: "test3@test3.com",
          firstName: "test",
          lastName: "lastName",
          password: "password",
          roles: ["admin"],
        }
      });
      const json = await res.json();
      const user = await userService.getById(json.id);

      // Assert
      expect(res.statusCode).toBe(201);
      expect(json).toMatchObject({
        id: expect.any(String),
        email: "test3@test3.com",
        firstName: "test",
        lastName: "lastName",
        roles: ["admin"],
      });
      expect(user).toMatchObject({
        id: expect.any(String),
        email: "test3@test3.com",
        firstName: "test",
        lastName: "lastName",
        roles: ["admin"],
      });
    });
  });

  it("should return 400 for unique constraints", async () => {
    // Arrange

    // Act
    await app.inject({
      method: "POST",
      url: "/api/v1/internal/users",
      body: {
        email: "test3@test3.com",
        firstName: "test",
        lastName: "lastName",
        password: "password",
        roles: ["admin"],
        // phone: "123456789"
      }
    });
    const duplicateEmailRes = await app.inject({
      method: "POST",
      url: "/api/v1/internal/users",
      body: {
        email: "test3@test3.com",
        firstName: "test2",
        lastName: "lastName2",
        password: "password2",
        roles: ["user"],
        // phone: "0123456789"
      }
    });
    const duplicateEmailJson = await duplicateEmailRes.json();
    // const duplicatePhoneRes = await app.inject({
    //   method: "POST",
    //   url: "/api/v1/internal/users",
    //   body: {
    //     email: "test4@test4.com",
    //     firstName: "test2",
    //     lastName: "lastName2",
    //     password: "password2",
    //     roles: ["user"],
    //     phone: "123456789"
    //   }
    // });

    // Assert
    expect(duplicateEmailRes.statusCode).toBe(400);
    expect(duplicateEmailJson.message).toBe("Email already in use");
    // expect(duplicatePhoneRes.statusCode).toBe(400);
  });

});
