import { build, TApp } from "@/server";
import { cleanupDatabase, tearDownDatabase } from "@/test/helpers/database-helper";
import { db } from "@/db/client";
import { InjectOptions } from "fastify";
import { AuthSetupFn, setupAuth } from "@/test/setup-auth";

describe("POST /api/v1/internal/workflows #api #integration #internal", () => {
  let app: TApp;
  let authFn: AuthSetupFn;

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

  describe("when unauthenticated", () => {
    it("should return 401", async () => {

      // Arrange
      const injectOptions = {
        method: "POST",
        url: "/api/v1/internal/workflows",
        body: {
          name: "name",
          reviewMachineId: "reviewMachineId",
          definitionType: "statechart-json",
          definition: {},
          extensions: [],
          backend: {},
          persistStates: [],
          submitStates: []
        }
      } satisfies InjectOptions;

      // Act
      const res = await app.inject(injectOptions);

      // Assert
      expect(res.statusCode).toEqual(401);
    });
  });

  describe("when missing required fields", () => {
    it("should return 400", async () => {

      // Arrange
      const injectOptions = {
        method: "POST",
        url: "/api/v1/internal/workflows",
        body: {}
      } satisfies InjectOptions;

      // Act
      const authHeaders = await authFn.getHeaders();
      const res = await app.inject({
        ...injectOptions,
        ...authHeaders
      });

      // Assert
      expect(res.statusCode).toEqual(400);
    });
  });

  describe("when fields are invalid", () => {
    it("should return 400", async () => {

      // Arrange
      const injectOptions = {
        method: "POST",
        url: "/api/v1/internal/workflows",
        body: {
          name: {},
          reviewMachineId: [],
          definitionType: {},
          definition: {},
          extensions: [],
          backend: 123,
          persistStates: true,
          submitStates: false
        }
      } satisfies InjectOptions;

      // Act
      const authHeaders = await authFn.getHeaders();
      const res = await app.inject({
        ...injectOptions,
        ...authHeaders
      });

      // Assert
      expect(res.statusCode).toEqual(400);
    });
  });

  describe("when fields are valid", () => {
    it("should return 201", async () => {

      // Arrange
      const injectOptions = {
        method: "POST",
        url: "/api/v1/internal/workflows",
        body: {
          name: "name",
          reviewMachineId: "reviewMachineId",
          definitionType: "statechart-json",
          definition: {},
          extensions: [],
          backend: {},
          persistStates: [],
          submitStates: []
        }
      } satisfies InjectOptions;

      // Act
      const authHeaders = await authFn.getHeaders();
      const res = await app.inject({
        ...injectOptions,
        ...authHeaders
      });
      const json = await res.json();

      // Assert
      expect(res.statusCode).toEqual(201);
      expect(json).toEqual({
        id: expect.any(String),
        name: "name",
        definitionType: "statechart-json",
        definition: {},
        extensions: [],
        backend: {},
        persistStates: [],
        submitStates: [],
        version: 1
      });
    });
  });

});