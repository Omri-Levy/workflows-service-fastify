import { EndUserRepository } from "@/end-user/end-user.repository";
import { db } from "@/db/client";
import { EndUserService } from "@/end-user/end-user.service";
import { WorkflowService } from "@/workflow/workflow.service";
import { WorkflowDefinitionRepository } from "@/workflow/workflow-definition.repository";
import { WorkflowRuntimeDataRepository } from "@/workflow/workflow-runtime-data.repository";
import { BusinessRepository } from "@/business/business.repository";
import { StorageService } from "@/storage/storage.service";
import { FileRepository } from "@/storage/storage.repository";
import { FileService } from "@/providers/file/file.service";
import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { faker } from "@faker-js/faker";
import { isRecordNotFoundError } from "@/db/db.util";
import { makeFullWorkflow } from "@/workflow/utils/make-full-workflow";
import { Type } from "@sinclair/typebox";
import { EndUserFindManyArgs } from "@/end-user/dtos/end-user-find-many-args";
import { EndUserSchema, WorkflowDefinitionSchema, WorkflowRuntimeDataSchema } from "@/common/schemas";
import { NotFoundError } from "@/common/errors/not-found-error";

export const endUserControllerExternal: FastifyPluginAsyncTypebox = async (fastify) => {

  const endUserRepository = new EndUserRepository(
    db
  );
  const endUserService = new EndUserService(endUserRepository);
  const workflowDefinitionRepository = new WorkflowDefinitionRepository(db);
  const workflowRuntimeDataRepository = new WorkflowRuntimeDataRepository(db);
  const businessRepository = new BusinessRepository(db);
  const fileRepository = new FileRepository(db);
  const storageService = new StorageService(fileRepository);
  const fileService = new FileService();
  const workflowService = new WorkflowService(
    workflowDefinitionRepository,
    workflowRuntimeDataRepository,
    endUserRepository,
    businessRepository,
    storageService,
    fileService
  );

  fastify.post("/", {
      schema: {
        description: "Create a new end-user",
        tags: ["External", "End-users"],
        body: Type.Object({
          firstName: Type.String(),
          lastName: Type.String(),
        }, {
          additionalProperties: false
        }),
        response: {
          201: Type.Pick(EndUserSchema, ["id", "firstName", "lastName", "avatarUrl"]),
          400: Type.Object({
            status: Type.String(),
            message: Type.String()
          }),
          401: Type.Object({
            status: Type.String(),
            message: Type.String()
          }),
          500: Type.Object({
            status: Type.Optional(Type.String()),
            code: Type.Optional(Type.Number()),
            message: Type.String()
          })
        }
      }
    },
    async (req, reply) => {
      const { firstName, lastName } = req.body;
      const endUser = await endUserService.create({
        data: {
          firstName,
          lastName,
          correlationId: faker.datatype.uuid(),
          email: faker.internet.email(firstName, lastName),
          phone: faker.phone.number("+##########"),
          dateOfBirth: faker.date.past(60),
          avatarUrl: faker.image.avatar()
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatarUrl: true
        }
      });

      return reply.status(201).send(endUser);
    }
  );

  fastify.get("/",
    {
      schema: {
        description: "Fetch a list of end-users based on query parameters",
        tags: ["External", "End-users"],
        querystring: EndUserFindManyArgs,
        response: {
          200: Type.Array(Type.Omit(EndUserSchema, ["endUsersOnBusinesses", "workflowRuntimeData", "businesses"])),
          400: Type.Object({
            status: Type.String(),
            message: Type.String()
          }),
          401: Type.Object({
            status: Type.String(),
            message: Type.String()
          }),
          500: Type.Object({
            status: Type.Optional(Type.String()),
            code: Type.Optional(Type.Number()),
            message: Type.String()
          })
        }
      }
    },
    async (req, reply) => {
      const endUsers = await endUserService.list(req.query);

      return reply.send(endUsers);
    });

  fastify.get("/:id",
    {
      schema: {
        description: "Retrieve an end-user by its unique ID",
        tags: ["External", "End-user"],
        params: Type.Object({
          id: Type.String({ description: "Unique ID of the end user" })
        }),
        response: {
          200: Type.Omit(EndUserSchema, ["endUsersOnBusinesses", "workflowRuntimeData", "businesses"]),
          400: Type.Object({
            status: Type.String(),
            message: Type.String()
          }),
          404: Type.Object({
            status: Type.String(),
            message: Type.String()
          }),
          401: Type.Object({
            status: Type.String(),
            message: Type.String()
          }),
          500: Type.Object({
            status: Type.Optional(Type.String()),
            code: Type.Optional(Type.Number()),
            message: Type.String()
          })
        }
      }
    },
    async (req, reply) => {

      try {
        const endUser = await endUserService.getById(req.params.id);

        return reply.send(endUser);
      } catch (err) {
        if (isRecordNotFoundError(err)) {
          throw new NotFoundError(`No resource was found for ${JSON.stringify(req.params.id)}`);
        }

        throw err;
      }
    });

  fastify.get("/:endUserId/workflows", {
      schema: {
        description: "Fetch a list of workflows associated with a specific end-user",
        tags: ["External", "Workflows"],
        params: Type.Object({
          endUserId: Type.String({ description: "ID of the end-user" })
        }),
        response: {
          200: Type.Array(
            Type.Object({
              workflowDefinition: Type.Omit(WorkflowDefinitionSchema, ["workflowRuntimeData"]),
              workflowRuntimeData: Type.Omit(WorkflowRuntimeDataSchema, ["workflowDefinition"])
            })
          ),
          400: Type.Object({
            status: Type.String(),
            message: Type.String()
          }),
          404: Type.Object({
            status: Type.String(),
            message: Type.String()
          }),
          401: Type.Object({
            status: Type.String(),
            message: Type.String()
          }),
          500: Type.Object({
            status: Type.Optional(Type.String()),
            code: Type.Optional(Type.Number()),
            message: Type.String()
          })
        }
      }
    }
    , async (req, reply) => {
      const endUserId = req.params.endUserId;
      const workflowRuntimeDataWithDefinition =
        await workflowService.listFullWorkflowDataByUserId({
          entityId: endUserId,
          entity: "endUser"
        });
      const fullWorkflows = makeFullWorkflow(workflowRuntimeDataWithDefinition);

      return reply.send(fullWorkflows);
    });

};